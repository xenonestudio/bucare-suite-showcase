import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authenticateJWT, authorizeRoles } from '../../shared/middlewares/auth.middleware.js';
import { whatsappService } from '../../services/whatsapp.service.js';

const router = Router();

// GET /api/v1/whatsapp/status -> Obtiene estado de WhatsApp activa
router.get('/status', authenticateJWT, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await whatsappService.getStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/init -> Inicializa sesión de WhatsApp (opcionalmente pasándole un número en body)
router.post('/init', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    // Inicia de forma asíncrona para no colgar la llamada HTTP
    whatsappService.initialize(phone).catch((err) => console.error('[WhatsAppRoutes] Init error:', err));

    res.status(200).json({
      success: true,
      message: `Inicialización de WhatsApp para ${phone || 'por defecto'} iniciada en segundo plano.`,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/restart -> Reinicia la conexión activa
router.post('/restart', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    whatsappService.restart().catch((err) => console.error('[WhatsAppRoutes] Restart error:', err));

    res.status(200).json({
      success: true,
      message: 'Reinicio de conexión de WhatsApp iniciado.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/disconnect -> Cierra sesión de WhatsApp
router.post('/disconnect', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await whatsappService.disconnect();
    res.status(200).json({
      success: true,
      message: 'Sesión de WhatsApp desconectada.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/whatsapp/chats -> Obtiene conversaciones asociadas a la sesión activa
router.get('/chats', authenticateJWT, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const chats = await whatsappService.getChats();
    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/whatsapp/contacts -> Obtiene contactos asociados a la sesión activa
router.get('/contacts', authenticateJWT, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await whatsappService.getContacts();
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/whatsapp/chats/:chatId/messages -> Mensajes de una conversación de WhatsApp
router.get('/chats/:chatId/messages', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params as { chatId: string };
    const messages = await whatsappService.getChatMessages(chatId);
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/chats/:chatId/sync-messages -> Sincroniza mensajes reales desde la API externa (GET /api/chats/:jid/messages)
router.post('/chats/:chatId/sync-messages', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params as { chatId: string };
    const result = await whatsappService.syncChatMessages(chatId);
    res.status(200).json({
      success: true,
      message: `${result.synced} mensajes nuevos importados de ${result.total} en la API externa.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/whatsapp/chats/:chatId/toggle-ai -> Activar/Desactivar IA para esta conversación específica
router.patch('/chats/:chatId/toggle-ai', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params as { chatId: string };
    const { isAiActive } = req.body;
    const chat = await whatsappService.toggleAi(chatId, Boolean(isAiActive));
    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/send -> Envia mensaje (desde el panel hacia un número) y lo almacena
router.post('/send', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      res.status(400).json({
        success: false,
        message: 'Se requieren las propiedades phone y message.',
      });
      return;
    }

    const result = await whatsappService.sendTextMessage(phone, message, 'ADMIN');

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Mensaje de WhatsApp enviado.' : 'No se pudo enviar el mensaje. Verifica que WhatsApp esté conectado.',
      data: result.success ? { externalId: result.externalId } : undefined,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/simulate-incoming -> Endpoint interactivo para simular mensaje de cliente y auto-respuesta IA
router.post('/simulate-incoming', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      res.status(400).json({
        success: false,
        message: 'Se requieren las propiedades phone y message (texto simulado del cliente).',
      });
      return;
    }

    // Procesa de forma asíncrona la respuesta del cliente y la IA
    whatsappService.receiveMessageSimulation(phone, message)
      .catch((err) => console.error('[WhatsAppRoutes Simulation] Error:', err));

    res.status(200).json({
      success: true,
      message: 'Mensaje de cliente simulado recibido en segundo plano.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/whatsapp/contacts/export -> Exportar contactos a VCF
router.get('/contacts/export', authenticateJWT, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const vcfString = await whatsappService.exportContactsToVCF();
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', 'attachment; filename=contactos.vcf');
    res.status(200).send(vcfString);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/contacts/import -> Importar contactos desde VCF
router.post('/contacts/import', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vcfContent } = req.body;
    if (!vcfContent) {
      res.status(400).json({
        success: false,
        message: 'Se requiere la propiedad vcfContent en formato string.',
      });
      return;
    }

    const count = await whatsappService.importContactsFromVCF(vcfContent);
    res.status(200).json({
      success: true,
      message: `${count} contactos importados con éxito.`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/whatsapp/contacts/:contactId -> Actualizar detalles de un contacto
router.put('/contacts/:contactId', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactId } = req.params as { contactId: string };
    const updated = await whatsappService.updateContact(contactId, req.body);
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/sync -> Sincroniza conversaciones de WhatsApp desde la API externa
router.post('/sync', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await whatsappService.syncExternalChats();
    res.status(200).json({
      success: true,
      message: `${count} chats sincronizados correctamente desde la API externa.`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/whatsapp/webhook-config -> Obtiene la configuración actual del webhook de alertas
router.get('/webhook-config', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = whatsappService.getWebhookConfig();
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/whatsapp/webhook-config -> Actualiza la URL y secreto del webhook de alertas en tiempo real
router.put('/webhook-config', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { alertWebhookUrl, alertWebhookSecret } = req.body;
    whatsappService.setWebhookConfig(alertWebhookUrl || '', alertWebhookSecret);
    const config = whatsappService.getWebhookConfig();
    res.status(200).json({
      success: true,
      message: 'Configuración de webhook de alertas actualizada.',
      data: config,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/webhook -> Recibe eventos webhook desde Bucare Assistant (WA-Automate)
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Verificar firma si el secreto está configurado
    if (webhookSecret) {
      const signature = req.headers['x-bucare-signature'] as string;
      if (!signature) {
        res.status(401).json({ success: false, message: 'Falta la firma del webhook' });
        return;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        res.status(401).json({ success: false, message: 'Firma de webhook inválida' });
        return;
      }
    }

    // Procesar el webhook de forma asíncrona para responder de inmediato a la plataforma externa
    whatsappService.handleIncomingWebhook(req.body)
      .catch((err) => console.error('[WhatsAppRoutes Webhook] Error procesando webhook:', err));

    res.status(200).json({
      success: true,
      message: 'Webhook recibido y en proceso.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
