import { citasRepository } from './citas.repository.js';
import { CreateCitaDto, UpdateCitaDto } from './citas.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { sendEventNotification } from '../notifications/notifications.routes.js';
import { sendClientCitaConfirmation, sendSalesNotification } from '../../services/email.service.js';

export class CitasService {
  async createCita(data: CreateCitaDto) {
    const cita = await citasRepository.create(data);

    const clientName  = (cita as any).cliente?.fullName  || (cita as any).cliente?.email || 'Un cliente';
    const clientEmail = (cita as any).cliente?.email || '';

    // Formatear fecha legible en zona horaria Venezuela
    const fechaCita = new Date(cita.fecha).toLocaleString('es-VE', {
      timeZone: 'America/Caracas',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // ── Notificación Push al equipo (fire & forget) ──
    try {
      sendEventNotification(
        'cita.created',
        'Nueva Cita Agendada 📅',
        `${clientName} agendó una cita para el ${fechaCita}.`,
        '/dashboard/citas'
      );
    } catch (e) {
      console.error('[CitasService] Error al enviar notificación push:', e);
    }


    // ── Envío de Correos (fire & forget, no bloquea la respuesta API) ──
    const emailData = {
      clienteNombre: clientName,
      clienteEmail:  clientEmail,
      fechaCita,
      tipoPropiedad: cita.tipoPropiedad as 'APARTAMENTO' | 'LOCAL',
      notas:  (cita as any).notas  || undefined,
      citaId: cita.id,
    };

    // Correo de confirmación al cliente
    if (clientEmail) {
      sendClientCitaConfirmation(emailData).catch((e) =>
        console.error('[CitasService] Error enviando confirmación al cliente:', e)
      );
    }

    // Correo de notificación interna a ventas
    sendSalesNotification(emailData).catch((e) =>
      console.error('[CitasService] Error enviando notificación a ventas:', e)
    );

    return cita;
  }


  async getAllCitas() {
    return citasRepository.findAll();
  }

  async getCitaById(id: string) {
    const cita = await citasRepository.findById(id);
    if (!cita) throw new AppError('Cita no encontrada', 404);
    return cita;
  }

  async updateCita(id: string, data: UpdateCitaDto) {
    await this.getCitaById(id);
    return citasRepository.update(id, data);
  }

  async deleteCita(id: string) {
    await this.getCitaById(id);
    await citasRepository.delete(id);
  }
}

export const citasService = new CitasService();
