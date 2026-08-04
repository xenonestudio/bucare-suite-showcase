import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.config.js';
import { generateGeminiResponse, fetchAvailableGeminiModels } from '../../services/gemini.service.js';

/**
 * Obtener o crear sesión de chat (Soporta Usuario Autenticado o Invitado por Token).
 */
export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const rawGuestToken = req.headers['x-guest-token'] || req.query.guestToken;
    const guestToken = typeof rawGuestToken === 'string' ? rawGuestToken.trim() : undefined;

    const rawGuestName = req.headers['x-guest-name'] || req.query.guestName;
    const guestName = typeof rawGuestName === 'string' ? rawGuestName.trim() : undefined;

    if (!userId && !guestToken) {
      return res.status(400).json({ error: 'Se requiere token de autenticación o x-guest-token' });
    }

    const projectParam = req.query.project;
    const project = (typeof projectParam === 'string' && projectParam === 'BUCARE_PLAZA') ? 'BUCARE_PLAZA' : 'BUCARE_SUITE';

    let session = null;

    if (userId) {
      session = await prisma.chatSession.findFirst({
        where: { userId, project },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    } else if (guestToken) {
      session = await prisma.chatSession.findFirst({
        where: { guestToken, project },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: userId || null,
          guestToken: userId ? null : guestToken,
          guestName: userId ? null : guestName || null,
          project,
          isAiActive: true,
          messages: {
            create: {
              sender: 'AI',
              content: project === 'BUCARE_PLAZA'
                ? '¡Hola! Bienvenido a Bucare Plaza Comercial. ¿En qué puedo ayudarte hoy sobre nuestros locales y espacios comerciales?'
                : '¡Hola! Bienvenido a Bucare Suite. ¿En qué puedo ayudarte hoy sobre nuestros apartamentos y residencias de lujo?',
            },
          },
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    } else if (!userId && guestName && session.guestName !== guestName) {
      // Actualizar nombre del invitado si cambió
      session = await prisma.chatSession.update({
        where: { id: session.id },
        data: { guestName },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    }

    return res.json({ status: 'success', data: session });
  } catch (error) {
    next(error);
  }
}

/**
 * Enviar mensaje del usuario o invitado y generar respuesta de la IA (si está activa).
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const rawGuestToken = req.headers['x-guest-token'] || req.body.guestToken;
    const guestToken = typeof rawGuestToken === 'string' ? rawGuestToken.trim() : undefined;

    const rawGuestName = req.headers['x-guest-name'] || req.body.guestName;
    const guestName = typeof rawGuestName === 'string' ? rawGuestName.trim() : undefined;

    if (!userId && !guestToken) {
      return res.status(400).json({ error: 'Se requiere token de autenticación o x-guest-token' });
    }

    const { message, project } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const currentProject = project === 'BUCARE_PLAZA' ? 'BUCARE_PLAZA' : 'BUCARE_SUITE';

    let session = null;

    if (userId) {
      session = await prisma.chatSession.findFirst({
        where: { userId, project: currentProject },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    } else if (guestToken) {
      session = await prisma.chatSession.findFirst({
        where: { guestToken, project: currentProject },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: userId || null,
          guestToken: userId ? null : guestToken,
          guestName: userId ? null : guestName || null,
          project: currentProject,
          isAiActive: true,
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    } else if (!userId && guestName && session.guestName !== guestName) {
      session = await prisma.chatSession.update({
        where: { id: session.id },
        data: { guestName },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    // 1. Guardar mensaje del usuario
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: 'USER',
        content: message.trim(),
      },
    });

    // 2. Si la IA está activa, generar respuesta con Gemini
    let aiMessage = null;
    if (session.isAiActive) {
      const userObj = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      const customConfig = await prisma.aiConfig.findUnique({ where: { project: currentProject } });

      const historyFormatted = session.messages.map((m) => ({
        sender: m.sender as 'USER' | 'AI' | 'ADMIN',
        content: m.content,
      }));

      const aiResponseContent = await generateGeminiResponse({
        userId,
        userFullName: userObj?.fullName || undefined,
        userEmail: userEmail || undefined,
        isAuthenticated: Boolean(userId),
        guestName: session.guestName || guestName || undefined,
        project: currentProject as 'BUCARE_SUITE' | 'BUCARE_PLAZA',
        systemPrompt: customConfig?.systemPrompt,
        selectedModel: customConfig?.selectedModel || undefined,
        history: historyFormatted,
        userMessage: message.trim(),
      });

      aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: 'AI',
          content: aiResponseContent,
        },
      });
    }

    // Actualizar fecha de la sesión
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return res.json({
      status: 'success',
      data: {
        userMessage,
        aiMessage,
        isAiActive: session.isAiActive,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Vincular / Asignar la sesión de chat de un invitado a un usuario que acaba de Iniciar Sesión o Registrarse.
 */
export async function claimGuestSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { guestToken } = req.body;
    if (!guestToken || typeof guestToken !== 'string') {
      return res.status(400).json({ error: 'guestToken es requerido' });
    }

    // Buscar sesiones creadas con este guestToken
    const guestSessions = await prisma.chatSession.findMany({
      where: { guestToken: guestToken.trim() },
      include: { messages: true },
    });

    if (guestSessions.length === 0) {
      return res.json({ status: 'success', message: 'No hay sesiones invitadas para asociar', count: 0 });
    }

    let migratedCount = 0;

    for (const gSession of guestSessions) {
      // Verificar si el usuario ya tiene una sesión previa en este mismo proyecto
      const existingUserSession = await prisma.chatSession.findFirst({
        where: { userId, project: gSession.project },
      });

      if (existingUserSession) {
        // Mover todos los mensajes de la sesión guest a la sesión existente del usuario
        if (gSession.messages.length > 0) {
          await prisma.chatMessage.updateMany({
            where: { sessionId: gSession.id },
            data: { sessionId: existingUserSession.id },
          });
        }
        // Eliminar la sesión de invitado duplicada
        await prisma.chatSession.delete({ where: { id: gSession.id } });
        await prisma.chatSession.update({
          where: { id: existingUserSession.id },
          data: { updatedAt: new Date() },
        });
      } else {
        // Asignar directamente la sesión de invitado al usuario
        await prisma.chatSession.update({
          where: { id: gSession.id },
          data: {
            userId,
            guestToken: null,
            guestName: null,
            updatedAt: new Date(),
          },
        });
      }
      migratedCount++;
    }

    return res.json({
      status: 'success',
      message: 'Sesión de invitado vinculada exitosamente a la cuenta del usuario',
      count: migratedCount,
    });
  } catch (error) {
    next(error);
  }
}

// ── ENDPOINTS DE ADMINISTRADOR ──────────────────────────────────────────────────

/**
 * Listar todas las sesiones de chat (para Administradores).
 */
export async function getAdminSessions(_req: Request, res: Response, next: NextFunction) {
  try {
    const sessions = await prisma.chatSession.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ status: 'success', data: sessions });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener detalle y todos los mensajes de una sesión específica (Admin).
 */
export async function getAdminSessionDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true, phoneNumber: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });

    return res.json({ status: 'success', data: session });
  } catch (error) {
    next(error);
  }
}

/**
 * Activar o pausar la respuesta automática de IA en una sesión (Admin).
 */
export async function toggleAiIntervention(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.sessionId as string;
    const { isAiActive } = req.body;

    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { isAiActive: Boolean(isAiActive) },
    });

    return res.json({ status: 'success', data: session });
  } catch (error) {
    next(error);
  }
}

/**
 * Enviar respuesta manual de un administrador a un cliente.
 */
export async function sendAdminReply(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.sessionId as string;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const adminMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: 'ADMIN',
        content: message.trim(),
      },
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return res.json({ status: 'success', data: adminMessage });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener la configuración del System Prompt y Modelo seleccionado para IA (Admin).
 */
export async function getAiConfig(_req: Request, res: Response, next: NextFunction) {
  try {
    const configs = await prisma.aiConfig.findMany();
    return res.json({ status: 'success', data: configs });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar la configuración del System Prompt y Modelo para un proyecto (Admin).
 */
export async function updateAiConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { project, systemPrompt, selectedModel } = req.body;
    if (!project || !systemPrompt) {
      return res.status(400).json({ error: 'Proyecto y System Prompt requeridos' });
    }

    const config = await prisma.aiConfig.upsert({
      where: { project },
      update: { systemPrompt, selectedModel },
      create: { project, systemPrompt, selectedModel },
    });

    return res.json({ status: 'success', data: config });
  } catch (error) {
    next(error);
  }
}

/**
 * Consultar dinámicamente a la API de Gemini los modelos disponibles (Admin).
 */
export async function getAvailableModels(_req: Request, res: Response, next: NextFunction) {
  try {
    const models = await fetchAvailableGeminiModels();
    return res.json({ status: 'success', data: models });
  } catch (error) {
    next(error);
  }
}
