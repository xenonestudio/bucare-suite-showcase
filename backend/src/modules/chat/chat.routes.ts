import { Router } from 'express';
import {
  getSession,
  sendMessage,
  claimGuestSession,
  getAdminSessions,
  getAdminSessionDetails,
  toggleAiIntervention,
  sendAdminReply,
  getAiConfig,
  updateAiConfig,
  getAvailableModels,
} from './chat.controller.js';
import { authenticateJWT, optionalAuthenticateJWT, authorizeRoles } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

// Rutas de Cliente & Invitados
router.get('/session', optionalAuthenticateJWT, getSession);
router.post('/send', optionalAuthenticateJWT, sendMessage);
router.post('/claim-guest-session', authenticateJWT, claimGuestSession);

// Rutas de Administración (requieren token + rol ADMIN o SUPERADMIN)
router.get('/admin/sessions', authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'), getAdminSessions);
router.get('/admin/session/:sessionId', authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'), getAdminSessionDetails);
router.patch('/admin/session/:sessionId/toggle-ai', authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'), toggleAiIntervention);
router.post('/admin/session/:sessionId/reply', authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'), sendAdminReply);
router.get('/admin/config', authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'), getAiConfig);
router.put('/admin/config', authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'), updateAiConfig);
router.get('/admin/available-models', authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'), getAvailableModels);

export default router;
