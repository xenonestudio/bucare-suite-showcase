import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// Configuración SMTP — mail.bucaresuite.com | Puerto 465 | SSL/TLS
// ─────────────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'mail.bucaresuite.com',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: 'noreplay@bucaresuite.com',
    pass: process.env.EMAIL_PASS || '',
  },
  tls: {
    rejectUnauthorized: false, // Compatibilidad con cPanel self-signed certs
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
export interface CitaEmailData {
  clienteNombre: string;
  clienteEmail: string;
  fechaCita: string;
  tipoPropiedad: 'APARTAMENTO' | 'LOCAL';
  notas?: string;
  citaId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de Estilo
// ─────────────────────────────────────────────────────────────────────────────
const propiedadLabel = (tipo: 'APARTAMENTO' | 'LOCAL') =>
  tipo === 'APARTAMENTO' ? 'Bucare Suite (Apartamento de Lujo)' : 'Bucare Plaza (Local Comercial)';

const propiedadColor = (tipo: 'APARTAMENTO' | 'LOCAL') =>
  tipo === 'APARTAMENTO' ? '#C9A96E' : '#5B8DB8';

// ─────────────────────────────────────────────────────────────────────────────
// Template 1: Confirmación para el cliente
// ─────────────────────────────────────────────────────────────────────────────
function buildClientConfirmationEmail(data: CitaEmailData): string {
  const accentColor = propiedadColor(data.tipoPropiedad);
  const propLabel   = propiedadLabel(data.tipoPropiedad);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de Cita – Bucare Suite</title>
</head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1A1A1A;border-radius:16px;overflow:hidden;border:1px solid #2A2A2A;">

        <!-- Header con logo -->
        <tr>
          <td style="background:linear-gradient(135deg,#1C1008 0%,#2A1F08 100%);padding:40px 40px 32px;text-align:center;border-bottom:1px solid ${accentColor}33;">
            <div style="display:inline-block;margin-bottom:16px;">
              <span style="font-size:13px;letter-spacing:8px;color:${accentColor};font-weight:600;text-transform:uppercase;">BUCARE SUITE & PLAZA</span>
            </div>
            <div style="width:48px;height:2px;background:${accentColor};margin:0 auto 24px;"></div>
            <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">
              Tu cita ha sido registrada
            </h1>
            <p style="margin:10px 0 0;color:#A89070;font-size:14px;">
              Pronto nos pondremos en contacto contigo para confirmarla.
            </p>
          </td>
        </tr>

        <!-- Cuerpo principal -->
        <tr>
          <td style="padding:36px 40px;">

            <!-- Saludo -->
            <p style="margin:0 0 24px;color:#D0C8BC;font-size:15px;line-height:1.6;">
              Hola, <strong style="color:#FFFFFF;">${data.clienteNombre}</strong>.
            </p>
            <p style="margin:0 0 28px;color:#A0998F;font-size:14px;line-height:1.7;">
              Hemos recibido tu solicitud de visita y la hemos registrado exitosamente en nuestro sistema. 
              Uno de nuestros asesores comerciales revisará los detalles y se comunicará contigo a la brevedad 
              para confirmar el horario y brindarte toda la información que necesitas.
            </p>

            <!-- Resumen de Cita -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:12px;border:1px solid #2A2A2A;overflow:hidden;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #222222;">
                  <span style="font-size:11px;letter-spacing:3px;color:${accentColor};font-weight:600;text-transform:uppercase;">Detalles de tu Cita</span>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <!-- Fila fecha -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:16px 24px;border-bottom:1px solid #1E1E1E;width:36px;vertical-align:top;">
                        <span style="font-size:20px;">📅</span>
                      </td>
                      <td style="padding:16px 24px 16px 0;border-bottom:1px solid #1E1E1E;vertical-align:top;">
                        <div style="font-size:11px;color:#6B6560;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Fecha y Hora Solicitada</div>
                        <div style="font-size:15px;color:#FFFFFF;font-weight:600;">${data.fechaCita}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 24px;border-bottom:1px solid #1E1E1E;vertical-align:top;">
                        <span style="font-size:20px;">🏢</span>
                      </td>
                      <td style="padding:16px 24px 16px 0;border-bottom:1px solid #1E1E1E;vertical-align:top;">
                        <div style="font-size:11px;color:#6B6560;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Propiedad de Interés</div>
                        <div style="font-size:15px;color:#FFFFFF;font-weight:600;">${propLabel}</div>
                      </td>
                    </tr>
                    ${data.notas ? `
                    <tr>
                      <td style="padding:16px 24px;vertical-align:top;">
                        <span style="font-size:20px;">📝</span>
                      </td>
                      <td style="padding:16px 24px 16px 0;vertical-align:top;">
                        <div style="font-size:11px;color:#6B6560;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Notas Adicionales</div>
                        <div style="font-size:14px;color:#A0998F;line-height:1.5;">${data.notas}</div>
                      </td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Texto de seguimiento -->
            <p style="margin:0 0 28px;color:#A0998F;font-size:14px;line-height:1.7;">
              Si tienes alguna pregunta antes de la confirmación, no dudes en contactarnos respondiendo este correo 
              o a través de nuestros canales de atención. Estaremos encantados de ayudarte.
            </p>

            <!-- Ubicación -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;border-radius:10px;border-left:3px solid ${accentColor};overflow:hidden;margin-bottom:8px;">
              <tr>
                <td style="padding:16px 20px;">
                  <div style="font-size:11px;color:${accentColor};text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:6px;">📍 Ubicación</div>
                  <div style="font-size:13px;color:#C0B8B0;line-height:1.5;">Av. Principal, Sector Guayana, San Cristóbal, Venezuela.<br/>QQJC+93C, San Cristóbal, Táchira.</div>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#111111;border-top:1px solid #2A2A2A;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#4A4540;line-height:1.5;">
              Este correo fue enviado automáticamente por el sistema de Bucare Suite.<br/>
              Por favor no respondas directamente a esta dirección de correo.
            </p>
            <p style="margin:0;font-size:11px;color:#3A3530;">
              © ${new Date().getFullYear()} Bucare Suite & Plaza · San Cristóbal, Venezuela · noreplay@bucaresuite.com
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 2: Notificación interna para ventas
// ─────────────────────────────────────────────────────────────────────────────
function buildSalesNotificationEmail(data: CitaEmailData): string {
  const accentColor = propiedadColor(data.tipoPropiedad);
  const propLabel   = propiedadLabel(data.tipoPropiedad);
  const now = new Date().toLocaleString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva Cita Agendada – Notificación Interna</title>
</head>
<body style="margin:0;padding:0;background:#0D1117;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:40px 16px;">
    <tr><td align="center">

      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161B22;border-radius:16px;overflow:hidden;border:1px solid #21262D;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D1117 0%,#161B22 100%);padding:32px 40px;border-bottom:2px solid ${accentColor};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:11px;letter-spacing:4px;color:${accentColor};font-weight:700;text-transform:uppercase;">🔔 AVISO INTERNO — EQUIPO VENTAS</span>
                  <h1 style="margin:10px 0 0;color:#E6EDF3;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                    Nueva Cita Agendada
                  </h1>
                </td>
                <td align="right" valign="top">
                  <span style="display:inline-block;background:${accentColor}22;border:1px solid ${accentColor}55;border-radius:8px;padding:6px 14px;font-size:12px;color:${accentColor};font-weight:600;">PROGRAMADA</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alerta urgente -->
        <tr>
          <td style="background:#1C2128;padding:16px 40px;border-bottom:1px solid #21262D;">
            <p style="margin:0;font-size:13px;color:#8B949E;line-height:1.5;">
              ⏰ Recibido el <strong style="color:#E6EDF3;">${now}</strong> — Acción requerida: contactar al cliente para confirmar la cita.
            </p>
          </td>
        </tr>

        <!-- Datos del Cliente -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0 0 16px;font-size:11px;letter-spacing:3px;color:${accentColor};font-weight:700;text-transform:uppercase;">Datos del Cliente</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;border-radius:10px;border:1px solid #21262D;overflow:hidden;">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;width:160px;vertical-align:top;">
                  <span style="font-size:12px;color:#8B949E;">👤 Nombre</span>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;">
                  <span style="font-size:14px;color:#E6EDF3;font-weight:600;">${data.clienteNombre}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;vertical-align:top;">
                  <span style="font-size:12px;color:#8B949E;">✉️ Email</span>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;">
                  <a href="mailto:${data.clienteEmail}" style="font-size:14px;color:${accentColor};text-decoration:none;font-weight:500;">${data.clienteEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;vertical-align:top;">
                  <span style="font-size:12px;color:#8B949E;">📅 Fecha Solicitada</span>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;">
                  <span style="font-size:14px;color:#E6EDF3;font-weight:600;">${data.fechaCita}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;vertical-align:top;">
                  <span style="font-size:12px;color:#8B949E;">🏢 Propiedad</span>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #21262D;">
                  <span style="display:inline-block;background:${accentColor}22;border:1px solid ${accentColor}44;border-radius:6px;padding:3px 10px;font-size:13px;color:${accentColor};font-weight:600;">
                    ${propLabel}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;vertical-align:top;">
                  <span style="font-size:12px;color:#8B949E;">🔑 ID de Cita</span>
                </td>
                <td style="padding:14px 20px;">
                  <span style="font-size:12px;color:#6E7681;font-family:monospace;">${data.citaId}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${data.notas ? `
        <!-- Notas / Resumen -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;color:${accentColor};font-weight:700;text-transform:uppercase;">📋 Notas / Resumen Ejecutivo</p>
            <div style="background:#0D1117;border-radius:10px;border:1px solid #21262D;border-left:3px solid ${accentColor};padding:20px;">
              <p style="margin:0;font-size:13px;color:#8B949E;line-height:1.7;white-space:pre-wrap;">${data.notas}</p>
            </div>
          </td>
        </tr>` : ''}

        <!-- Acciones -->
        <tr>
          <td style="padding:28px 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="https://bucaresuite.com/dashboard/citas" 
                     style="display:inline-block;background:${accentColor};color:#0D1117;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                    Ver Cita en el Dashboard →
                  </a>
                </td>
                <td align="right">
                  <a href="mailto:${data.clienteEmail}?subject=Confirmación de Cita – Bucare Suite"
                     style="display:inline-block;background:transparent;color:${accentColor};font-size:13px;font-weight:600;padding:11px 20px;border-radius:8px;border:1px solid ${accentColor}55;text-decoration:none;">
                    Responder al Cliente
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0D1117;border-top:1px solid #21262D;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#3D444D;line-height:1.5;">
              Notificación automática interna generada por el sistema de Bucare Suite.<br/>
              © ${new Date().getFullYear()} Bucare Suite & Plaza · San Cristóbal, Venezuela
            </p>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Funciones Públicas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Envía correo de confirmación al cliente.
 */
export async function sendClientCitaConfirmation(data: CitaEmailData): Promise<void> {
  if (!data.clienteEmail) return;

  await transporter.sendMail({
    from: '"Bucare Suite & Plaza" <noreplay@bucaresuite.com>',
    to: data.clienteEmail,
    subject: '✅ Tu cita ha sido recibida – Bucare Suite & Plaza',
    html: buildClientConfirmationEmail(data),
  });

  console.log(`[EmailService] Confirmación de cita enviada a: ${data.clienteEmail}`);
}

/**
 * Envía notificación interna al equipo de ventas.
 */
export async function sendSalesNotification(data: CitaEmailData): Promise<void> {
  await transporter.sendMail({
    from: '"Sistema Bucare Suite" <noreplay@bucaresuite.com>',
    to: 'ventas@bucaresuite.com',
    subject: `🔔 Nueva Cita – ${data.clienteNombre} | ${data.tipoPropiedad === 'APARTAMENTO' ? 'Bucare Suite' : 'Bucare Plaza'}`,
    html: buildSalesNotificationEmail(data),
  });

  console.log(`[EmailService] Notificación de cita enviada a ventas@bucaresuite.com (cliente: ${data.clienteNombre})`);
}
