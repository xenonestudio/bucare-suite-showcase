import { Router } from 'express';
import { prisma } from '../../config/database.config.js';

const router = Router();

// Registrar una visita (pública)
router.post('/', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId es requerido' });
    }

    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    try {
      await prisma.visit.create({
        data: {
          sessionId,
          fecha: todayStr,
        },
      });
    } catch (e: any) {
      // Ignorar error si ya fue registrada hoy
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener conteo de visitas de hoy
router.get('/today', async (_req, res) => {
  try {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const count = await prisma.visit.count({
      where: { fecha: todayStr },
    });
    return res.status(200).json({ success: true, count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
