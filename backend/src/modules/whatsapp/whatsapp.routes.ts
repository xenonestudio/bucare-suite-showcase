import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT, authorizeRoles } from '../../shared/middlewares/auth.middleware.js';
import { whatsappService } from '../../services/whatsapp.service.js';

const router = Router();

// GET /api/v1/whatsapp/status -> Obtiene estado y QR de WhatsApp
router.get('/status', authenticateJWT, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = whatsappService.getStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/init -> Inicializa o reinicia cliente de WhatsApp
router.post('/init', authenticateJWT, authorizeRoles('SUPERADMIN' as any, 'ADMIN' as any), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Inicia en segundo plano para no bloquear HTTP response
    whatsappService.initialize().catch((err) => console.error('[WhatsAppRoutes] Init error:', err));

    res.status(200).json({
      success: true,
      message: 'Inicialización de WhatsApp iniciada en segundo plano.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/whatsapp/restart -> Reinicia la conexión
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

// POST /api/v1/whatsapp/send -> Envia mensaje de prueba o directo por WhatsApp
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

    const sent = await whatsappService.sendTextMessage(phone, message);

    res.status(200).json({
      success: sent,
      message: sent ? 'Mensaje de WhatsApp enviado.' : 'No se pudo enviar el mensaje. Verifica que WhatsApp esté conectado.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
