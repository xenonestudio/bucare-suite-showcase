import { Router } from 'express';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../config/database.config.js';
import { authenticateJWT } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

// Cargar o generar llaves VAPID automáticamente
const vapidKeysPath = path.join(process.cwd(), '.vapid_keys.json');
let vapidKeys: { publicKey: string; privateKey: string };

if (fs.existsSync(vapidKeysPath)) {
  vapidKeys = JSON.parse(fs.readFileSync(vapidKeysPath, 'utf8'));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(vapidKeysPath, JSON.stringify(vapidKeys, null, 2), 'utf8');
}

webpush.setVapidDetails(
  'mailto:soporte@bucaresuite.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Obtener la llave pública VAPID
router.get('/vapid-public-key', (_req, res) => {
  return res.status(200).json({ success: true, publicKey: vapidKeys.publicKey });
});

// GET /api/v1/notifications/settings -> Obtener configuraciones de eventos
router.get('/settings', authenticateJWT, async (_req, res) => {
  try {
    const settings = await prisma.notificationSetting.findMany({
      orderBy: { event: 'asc' }
    });
    return res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/notifications/settings -> Actualizar configuraciones de eventos
router.put('/settings', authenticateJWT, async (req, res) => {
  try {
    const { settings } = req.body; // Array de { event: string, enabled: boolean, roles: string }
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Se requiere un arreglo de configuraciones' });
    }

    for (const s of settings) {
      await prisma.notificationSetting.upsert({
        where: { event: s.event },
        update: { enabled: s.enabled, roles: s.roles },
        create: { event: s.event, enabled: s.enabled, roles: s.roles }
      });
    }

    return res.status(200).json({ success: true, message: 'Configuración actualizada con éxito' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


// Obtener las notificaciones del usuario autenticado
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user!.id;
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar todas como leídas
router.put('/read-all', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return res.status(200).json({ success: true, message: 'Notificaciones marcadas como leídas' });
  } catch (error: any) {
    console.error('Error al marcar notificaciones:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Registrar o actualizar una suscripción vinculada al usuario autenticado
router.post('/subscribe', authenticateJWT, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
      return res.status(400).json({ success: false, message: 'Datos de suscripción incompletos' });
    }

    const userId = req.user!.id;

    const savedSub = await prisma.notificationSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        keysAuth: keys.auth,
        keysP256dh: keys.p256dh
      },
      create: {
        userId,
        endpoint,
        keysAuth: keys.auth,
        keysP256dh: keys.p256dh
      }
    });

    console.log(`[Push Notification] Suscripción registrada para el usuario ${req.user!.email} (Rol: ${req.user!.role})`);

    return res.status(200).json({ success: true, data: savedSub });
  } catch (error: any) {
    console.error('Error al suscribir notificaciones:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Dar de baja una suscripción
router.post('/unsubscribe', authenticateJWT, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, message: 'Endpoint requerido' });
    }

    await prisma.notificationSubscription.deleteMany({
      where: { endpoint }
    });

    console.log(`[Push Notification] Suscripción eliminada para el usuario ${req.user!.email}`);

    return res.status(200).json({ success: true, message: 'Suscripción eliminada con éxito' });
  } catch (error: any) {
    console.error('Error al desuscribir notificaciones:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Enviar notificación de prueba (soporta tanto envío directo por payload como por base de datos)
router.post('/test', authenticateJWT, async (req, res) => {
  try {
    const { subscription, title, body } = req.body;
    const userId = req.user!.id;

    // Guardar la notificación en la base de datos para el historial web
    await prisma.notification.create({
      data: {
        userId,
        title: title || 'Bucare Suite',
        body: body || 'Esta es una notificación de prueba de Bucare Suite.',
        url: '/dashboard'
      }
    });

    if (subscription) {
      const payload = JSON.stringify({
        title: title || 'Bucare Suite',
        body: body || 'Esta es una notificación de prueba de Bucare Suite.',
        url: '/dashboard'
      });

      await webpush.sendNotification(subscription, payload);
    }

    return res.status(200).json({ success: true, message: 'Notificación de prueba enviada e historizada correctamente' });
  } catch (error: any) {
    console.error('Error al enviar web push de prueba:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Utilidades para enviar notificaciones push e historizar en la base de datos
 */

export async function sendPushToRoles(roles: string[], title: string, body: string, url?: string) {
  try {
    // 1. Guardar en historial de notificaciones de base de datos
    const targetUsers = await prisma.user.findMany({
      where: { role: { in: roles }, isActive: true }
    });

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map(u => ({
          userId: u.id,
          title,
          body,
          url: url || '/dashboard',
          read: false
        }))
      });
    }

    // 2. Buscar suscripciones activas
    const subscriptions = await prisma.notificationSubscription.findMany({
      where: {
        user: {
          role: { in: roles }
        }
      }
    });

    console.log(`[Push Notification] Enviando alerta a roles [${roles.join(', ')}]. Encontradas ${subscriptions.length} suscripciones.`);

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/dashboard'
    });

    const promises = subscriptions.map(sub => {
      const webPushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keysAuth,
          p256dh: sub.keysP256dh
        }
      };
      return webpush.sendNotification(webPushSubscription, payload)
        .catch(err => {
          console.error('[Push Notification] Fallo al enviar push a endpoint, limpiando:', sub.endpoint, err);
          if (err.statusCode === 410 || err.statusCode === 404) {
            return prisma.notificationSubscription.delete({ where: { id: sub.id } })
              .catch(dErr => console.error('[Push Notification] Error al borrar suscripción obsoleta:', dErr));
          }
        });
    });

    await Promise.all(promises);
  } catch (err) {
    console.error('[Push Notification] Error en sendPushToRoles:', err);
  }
}

export async function sendPushToUser(userId: string, title: string, body: string, url?: string) {
  try {
    // 1. Guardar en historial de notificaciones de base de datos
    await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        url: url || '/dashboard',
        read: false
      }
    });

    // 2. Buscar suscripciones activas
    const subscriptions = await prisma.notificationSubscription.findMany({
      where: { userId }
    });

    console.log(`[Push Notification] Enviando alerta individual al usuario ID ${userId}. Encontradas ${subscriptions.length} suscripciones.`);

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/dashboard'
    });

    const promises = subscriptions.map(sub => {
      const webPushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keysAuth,
          p256dh: sub.keysP256dh
        }
      };
      return webpush.sendNotification(webPushSubscription, payload)
        .catch(err => {
          console.error('[Push Notification] Fallo al enviar push a usuario, limpiando:', sub.id, err);
          if (err.statusCode === 410 || err.statusCode === 404) {
            return prisma.notificationSubscription.delete({ where: { id: sub.id } })
              .catch(dErr => console.error('[Push Notification] Error al borrar suscripción obsoleta:', dErr));
          }
        });
    });

    await Promise.all(promises);
  } catch (err) {
    console.error('[Push Notification] Error en sendPushToUser:', err);
  }
}

/**
 * Helper dinámico para enviar notificaciones basadas en configuración de eventos.
 * Verifica si el evento está habilitado y lo distribuye a los roles asignados.
 */
export async function sendEventNotification(event: string, title: string, body: string, url?: string) {
  try {
    const config = await prisma.notificationSetting.findUnique({
      where: { event }
    });

    if (!config || !config.enabled) {
      console.log(`[Push Notification] Evento "${event}" deshabilitado globalmente.`);
      return;
    }

    const roles = config.roles.split(',').map(r => r.trim()).filter(Boolean);
    if (roles.length === 0) {
      console.log(`[Push Notification] Evento "${event}" no tiene roles asignados.`);
      return;
    }

    await sendPushToRoles(roles, title, body, url);
  } catch (err) {
    console.error(`[Push Notification] Error en sendEventNotification para evento ${event}:`, err);
  }
}

export default router;

