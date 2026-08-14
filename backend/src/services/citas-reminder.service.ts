import { prisma } from '../config/database.config.js';
import { sendEventNotification } from '../modules/notifications/notifications.routes.js';

export function startCitasReminderCron() {
  console.log('[Reminder Service] Iniciando programador de recordatorios de citas (intervalo: 1 min)...');

  setInterval(async () => {
    try {
      const ahora = new Date();

      // ── 1. Alertas de 24 horas antes ──
      const hace24hMin = new Date(ahora.getTime() + 24 * 60 * 60 * 1000 - 5 * 60 * 1000);
      const hace24hMax = new Date(ahora.getTime() + 24 * 60 * 60 * 1000 + 5 * 60 * 1000);

      const citas24h = await prisma.cita.findMany({
        where: {
          fecha: {
            gte: hace24hMin,
            lte: hace24hMax,
          },
          estado: 'PROGRAMADA',
          sentReminder24h: false,
        },
        include: {
          cliente: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      for (const cita of citas24h) {
        const clientName = cita.cliente?.fullName || cita.cliente?.email || 'Un cliente';
        const horaLegible = new Date(cita.fecha).toLocaleTimeString('es-VE', {
          timeZone: 'America/Caracas',
          hour: '2-digit',
          minute: '2-digit',
        });

        await prisma.cita.update({
          where: { id: cita.id },
          data: { sentReminder24h: true },
        });

        console.log(`[Reminder Service] Enviando alerta de 24h para cita ID ${cita.id}`);
        sendEventNotification(
          'cita.reminder.24h',
          'Cita próxima (24 horas) ⏰',
          `La cita de ${clientName} es mañana a las ${horaLegible}.`,
          '/dashboard/citas'
        ).catch(e => console.error('Error enviando push cita.reminder.24h:', e));
      }

      // ── 2. Alertas del Momento de la Cita ──
      // Citas cuya fecha sea <= ahora + 5 minutos y no se haya enviado la alerta
      const citaLimite = new Date(ahora.getTime() + 5 * 60 * 1000);

      const citasTime = await prisma.cita.findMany({
        where: {
          fecha: {
            lte: citaLimite,
          },
          estado: 'PROGRAMADA',
          sentReminderTime: false,
        },
        include: {
          cliente: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      for (const cita of citasTime) {
        const clientName = cita.cliente?.fullName || cita.cliente?.email || 'Un cliente';

        await prisma.cita.update({
          where: { id: cita.id },
          data: { sentReminderTime: true },
        });

        console.log(`[Reminder Service] Enviando alerta de inicio para cita ID ${cita.id}`);
        sendEventNotification(
          'cita.time',
          'Cita Iniciando Ahora 📢',
          `La cita de ${clientName} está pautada para iniciar ahora mismo.`,
          '/dashboard/citas'
        ).catch(e => console.error('Error enviando push cita.time:', e));
      }

    } catch (err) {
      console.error('[Reminder Service] Error en ejecución de cron de citas:', err);
    }
  }, 60_000); // Ejecutar cada 1 minuto
}
