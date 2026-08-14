import { prisma } from '../config/database.config.js';
import { whatsappService } from './whatsapp.service.js';
import { sendClientCitaConfirmation, sendSalesNotification } from './email.service.js';

/**
 * Servicio de IA Gemini con Pool de API Keys, Rotación Inteligente, Selección Dinámica de Modelos,
 * Gestión de Nombre de Cliente y Agendamiento Automático de Citas con Resumen Ejecutivo Detallado mediante Function Calling.
 */

// API Keys leídas desde variable de entorno (separadas por coma)
// Formato en .env: GEMINI_API_KEYS=AIzaXXXXX,AIzaYYYYY,AIzaZZZZZ
const API_KEYS: string[] = (process.env.GEMINI_API_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k.length > 0);

if (API_KEYS.length === 0) {
  console.error('[GeminiService] ⚠️  No se encontraron API Keys en GEMINI_API_KEYS del .env. El chat de IA no funcionará.');
}

let activeKeyIndex = 0;

export function getApiKeysStatus() {
  return {
    totalKeys: API_KEYS.length,
    activeKeyIndex,
    activeKeyMasked: getActiveKey().substring(0, 8) + '...' + getActiveKey().substring(getActiveKey().length - 6),
  };
}

export function setActiveKeyIndex(index: number) {
  if (index >= 0 && index < API_KEYS.length) {
    activeKeyIndex = index;
    return true;
  }
  return false;
}

export interface ChatHistoryMessage {
  sender: 'USER' | 'AI' | 'ADMIN';
  content: string;
}

export interface GenerateAiOptions {
  userId?: string;
  userFullName?: string;
  userEmail?: string;
  isAuthenticated?: boolean;
  guestName?: string;
  project: 'BUCARE_SUITE' | 'BUCARE_PLAZA';
  systemPrompt?: string;
  selectedModel?: string;
  autoRotateModel?: boolean;
  history: ChatHistoryMessage[];
  userMessage: string;
}

export interface GeminiModelInfo {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

const DEFAULT_PROMPTS = {
  BUCARE_SUITE: `Eres el Asistente Virtual Inteligente de Bucare Suite (Apartamentos de Lujo en San Cristóbal, Nueva Guayana).
Tu objetivo es atender amablemente al cliente, responder sus dudas sobre los apartamentos de lujo, amenidades, acabados, ubicación y precios.
Sé profesional, cálido, elegante y servicial. Guía al cliente a agendar una visita o consultar disponibilidad.`,

  BUCARE_PLAZA: `Eres el Asistente Virtual Inteligente de Bucare Plaza (Plaza Comercial Boutique en San Cristóbal, Nueva Guayana).
Tu objetivo es brindar información estratégica a emprendedores, marcas e inversionistas sobre los locales comerciales, oficinas boutique, flujo peatonal, estacionamiento y disponibilidad.
Sé ejecutivo, enfocado en oportunidades de negocio y servicial.`,
};

function getActiveKey(): string {
  return API_KEYS[activeKeyIndex];
}

function rotateKey(): string {
  activeKeyIndex = (activeKeyIndex + 1) % API_KEYS.length;
  console.warn(`[GeminiKeyRotator] Cuota/Límite o Error de Key. Rotando a API Key índice ${activeKeyIndex}`);
  return getActiveKey();
}

/**
 * Declaración de Herramientas (Tools) de Gemini para Function Calling
 */
const AGENDAR_CITA_TOOL = {
  functionDeclarations: [
    {
      name: 'agendar_cita',
      description: 'Crea y agenda automáticamente una cita de visita en la base de datos para Bucare Suite (APARTAMENTO) o Bucare Plaza (LOCAL). SOLO debe invocarse cuando el asistente ya tiene: nombre completo del cliente, correo electrónico VÁLIDO (formato usuario@dominio.com) y número de teléfono.',
      parameters: {
        type: 'OBJECT',
        properties: {
          fecha: {
            type: 'STRING',
            description: 'Fecha y hora de la cita en formato YYYY-MM-DD HH:mm (ej. 2026-08-10 10:00)',
          },
          tipoPropiedad: {
            type: 'STRING',
            enum: ['APARTAMENTO', 'LOCAL'],
            description: 'Tipo de propiedad a visitar (APARTAMENTO para Bucare Suite, LOCAL para Bucare Plaza)',
          },
          notas: {
            type: 'STRING',
            description: 'RESUMEN EJECUTIVO de la conversación: interés, propósito, perfil profesional y requerimientos del cliente.',
          },
          nombreCliente: {
            type: 'STRING',
            description: 'Nombre completo del cliente, obligatorio para invitados no autenticados.',
          },
          emailCliente: {
            type: 'STRING',
            description: 'Correo electrónico del cliente en formato válido (usuario@dominio.com). OBLIGATORIO. El asistente debe solicitarlo y validar que tenga formato correcto antes de llamar esta herramienta.',
          },
          telefonoCliente: {
            type: 'STRING',
            description: 'Número de teléfono del cliente (con código de país si es posible). OBLIGATORIO para poder contactar al cliente.',
          },
          reagendar: {
            type: 'BOOLEAN',
            description: 'Si es true, indica que el cliente desea reagendar una cita anterior que ya venció.',
          },
        },
        required: ['fecha', 'tipoPropiedad', 'notas', 'emailCliente', 'telefonoCliente'],
      },
    },
  ],
};

/**
 * Consulta dinámicamente a la API de Google Gemini para obtener el listado de modelos disponibles.
 */
export async function fetchAvailableGeminiModels(): Promise<GeminiModelInfo[]> {
  let attempts = 0;
  while (attempts < API_KEYS.length) {
    const key = getActiveKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data: any = await res.json();
        const rawModels = data?.models || [];

        const filtered = rawModels
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => {
            const rawName = m.name || '';
            const id = rawName.replace(/^models\//, '');
            return {
              id,
              name: rawName,
              displayName: m.displayName || id,
              description: m.description || '',
            };
          });

        if (filtered.length > 0) return filtered;
      } else {
        rotateKey();
      }
    } catch (err) {
      console.error('[GeminiService] Error al listar modelos:', err);
      rotateKey();
    }
    attempts++;
  }

  return [
    { id: 'gemini-3.5-flash', name: 'models/gemini-3.5-flash', displayName: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.5-flash-lite', name: 'models/gemini-3.5-flash-lite', displayName: 'Gemini 3.5 Flash Lite' },
    { id: 'gemini-2.5-pro', name: 'models/gemini-2.5-pro', displayName: 'Gemini 2.5 Pro' },
  ];
}

/**
 * Valida formato de correo electrónico.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Maneja la ejecución de la función `agendar_cita` con validación completa:
 * - Valida email del cliente
 * - Detecta citas existentes activas o vencidas
 * - Crea o reagenda la cita según corresponda
 */
async function executeAgendarCita(args: any, options: GenerateAiOptions): Promise<string> {
  try {
    const { userId, userFullName, userEmail, guestName, project } = options;

    // ── 1. Validar email ──────────────────────────────────────────────────
    const emailRaw = args.emailCliente || userEmail || '';
    if (!emailRaw || !isValidEmail(emailRaw)) {
      return JSON.stringify({
        status: 'INVALID_EMAIL',
        mensaje: 'El correo electrónico proporcionado no tiene un formato válido. Por favor verifica que sea correcto (ej. nombre@dominio.com).',
      });
    }
    const emailCliente = emailRaw.trim().toLowerCase();
    const telefonoCliente = args.telefonoCliente || '';

    // ── 2. Verificar cita existente por email ─────────────────────────────
    const now = new Date();
    const citaExistente = await prisma.cita.findFirst({
      where: {
        estado: { in: ['PROGRAMADA', 'CONFIRMADA'] },
        OR: [
          { notas: { contains: emailCliente } },
          { cliente: { email: emailCliente } },
        ],
      },
      orderBy: { fecha: 'desc' },
      include: { cliente: { select: { email: true } } },
    });

    if (citaExistente && !args.reagendar) {
      const citaFecha = new Date(citaExistente.fecha);
      const citaDateFormatted = citaFecha.toLocaleString('es-VE', {
        timeZone: 'America/Caracas',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      // Si la cita existente YA VENCIÓ, ofrecer reagendar
      if (citaFecha < now) {
        return JSON.stringify({
          status: 'CITA_VENCIDA',
          citaId: citaExistente.id,
          fechaAnterior: citaDateFormatted,
          mensaje: `Encontramos una cita anterior agendada para el ${citaDateFormatted} que ya venció. ¿Deseas reagendarla para una nueva fecha?`,
        });
      }

      // Si la cita existente está VIGENTE
      return JSON.stringify({
        status: 'CITA_EXISTENTE',
        citaId: citaExistente.id,
        fechaCita: citaDateFormatted,
        mensaje: `Ya tienes una cita agendada para el ${citaDateFormatted}. Un asesor comercial se pondrá en contacto contigo a la brevedad por tu correo (${emailCliente}) o teléfono (${telefonoCliente || 'no registrado'}).`,
      });
    }

    // ── 3. Parsear fecha de la nueva cita ─────────────────────────────────
    let parsedDate = new Date(args.fecha);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // ── 4. Resolver clientRefId — crear usuario invitado si no existe ──────
    let clientRefId = userId;
    const clientName = userFullName || guestName || args.nombreCliente || 'Cliente Chat';

    if (!clientRefId) {
      // Buscar usuario existente por email o teléfono
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: emailCliente }, ...(telefonoCliente ? [{ phoneNumber: telefonoCliente }] : [])] },
      });

      if (existingUser) {
        clientRefId = existingUser.id;
        // Actualizar teléfono si faltaba
        if (telefonoCliente && !existingUser.phoneNumber) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { phoneNumber: telefonoCliente, fullName: existingUser.fullName || clientName },
          });
        }
      } else {
        // Crear usuario invitado con los datos proporcionados
        const guestUser = await prisma.user.create({
          data: {
            email: emailCliente,
            fullName: clientName,
            phoneNumber: telefonoCliente || null,
            role: 'CLIENTE',
            passwordHash: null,
            isActive: true,
          },
        });
        clientRefId = guestUser.id;
        console.log(`[GeminiService] Usuario invitado creado: ${guestUser.id} (${emailCliente})`);
      }
    }

    const executiveNotes = (args.notas ? args.notas.trim() : `Cliente: ${clientName}. Agendado vía IA Chat.`)
      + `\n--- Datos de contacto ---\nEmail: ${emailCliente}\nTeléfono: ${telefonoCliente || 'No proporcionado'}`;

    const dateFormatted = parsedDate.toLocaleString('es-VE', {
      timeZone: 'America/Caracas',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    // ── 5. Si es reagendamiento, cancelar cita anterior ───────────────────
    if (args.reagendar && citaExistente) {
      await prisma.cita.update({
        where: { id: citaExistente.id },
        data: { estado: 'CANCELADA' },
      });
      console.log(`[GeminiService] Cita anterior ${citaExistente.id} cancelada para reagendar.`);
    }

    // ── 6. Crear la cita ──────────────────────────────────────────────────
    const createdCita = await prisma.cita.create({
      data: {
        clienteId: clientRefId,
        fecha: parsedDate,
        tipoPropiedad: args.tipoPropiedad || (project === 'BUCARE_PLAZA' ? 'LOCAL' : 'APARTAMENTO'),
        estado: 'PROGRAMADA',
        notas: executiveNotes,
      },
    });

    console.log(`[GeminiService] Cita agendada ID: ${createdCita.id} para ${clientName} (${emailCliente}) fecha: ${dateFormatted}`);

    // Notificar vía WhatsApp si hay teléfono
    if (telefonoCliente) {
      whatsappService.sendAppointmentNotification(telefonoCliente, {
        fecha: dateFormatted,
        tipoPropiedad: createdCita.tipoPropiedad,
        notas: executiveNotes,
      }).catch(err => console.error('[GeminiService] Error notificando cita por WhatsApp:', err));
    }

    // Notificar vía Correo Electrónico
    const emailData = {
      clienteNombre: clientName,
      clienteEmail: emailCliente,
      fechaCita: dateFormatted,
      tipoPropiedad: createdCita.tipoPropiedad as 'APARTAMENTO' | 'LOCAL',
      notas: executiveNotes,
      citaId: createdCita.id,
    };

    sendClientCitaConfirmation(emailData).catch((e) =>
      console.error('[GeminiService] Error enviando confirmación al cliente por email:', e)
    );

    sendSalesNotification(emailData).catch((e) =>
      console.error('[GeminiService] Error enviando notificación de ventas por email:', e)
    );

    return JSON.stringify({
      status: 'SUCCESS',
      citaId: createdCita.id,
      fechaFormateada: dateFormatted,
      tipoPropiedad: createdCita.tipoPropiedad,
      emailCliente,
      telefonoCliente,
      reagendada: !!args.reagendar,
      mensaje: `Cita ${args.reagendar ? 'reagendada' : 'registrada'} con éxito para el ${dateFormatted}.`,
    });
  } catch (err: any) {
    console.error('[GeminiService] Error al ejecutar agendar_cita:', err);
    return JSON.stringify({
      status: 'ERROR',
      mensaje: 'Hubo un inconveniente temporal al registrar la cita. Por favor intenta de nuevo.',
    });
  }
}

export async function generateGeminiResponse(options: GenerateAiOptions): Promise<string> {
  const { userFullName, userEmail, isAuthenticated, guestName, project, systemPrompt, selectedModel, history, userMessage } = options;

  const basePrompt = systemPrompt || DEFAULT_PROMPTS[project];

  let userContext = '';
  if (isAuthenticated) {
    userContext = `[ESTADO DEL CLIENTE: AUTENTICADO EN REGISTRO]
Nombre registrado: ${userFullName || 'Cliente'}. Email: ${userEmail || ''}.
Regla: El cliente YA está autenticado. Refiérete a él por su nombre registrado ("${userFullName}"). NO le pidas registrarse ni le vuelvas a preguntar su nombre.`;
  } else if (guestName) {
    userContext = `[ESTADO DEL CLIENTE: VISITANTE NO AUTENTICADO]
Nombre indicado por el cliente: ${guestName}.
Regla: Trátalo amablemente llamándolo "${guestName}". YA CONOCES SU NOMBRE. NO vuelvas a preguntarle su nombre a menos que el cliente indique explícitamente que desea cambiarlo o que su nombre real es otro.`;
  } else {
    userContext = `[ESTADO DEL CLIENTE: VISITANTE NO AUTENTICADO - NOMBRE DESCONOCIDO]
Regla: Saluda amablemente al visitante. Si es uno de los primeros mensajes, pregúntale de forma cálida y natural cuál es su nombre para brindarle una atención personalizada. Si el usuario responde sólo un nombre directo (ej. "Carlos" o "Ana"), confirma amablemente: "¿Carlos es tu nombre?".`;
  }

  const citaInstruction = `\n[AGENDAMIENTO AUTOMÁTICO DE CITAS — FLUJO OBLIGATORIO]
Tienes la capacidad de agendar citas usando la herramienta 'agendar_cita'. Sigue ESTRICTAMENTE este flujo antes de invocarla:

PASO 1 — VERIFICAR NOMBRE: Confirma el nombre completo del cliente. Si ya lo conoces por el contexto, no vuelvas a pedirlo.
PASO 2 — SOLICITAR CORREO ELECTRÓNICO: Pide amablemente el correo electrónico del cliente. Verifica que tenga formato válido (usuario@dominio.com). Si no es válido, indícalo y vuelve a solicitarlo.
PASO 3 — SOLICITAR TELÉFONO: Solicita un número de teléfono de contacto (con código de país si es posible).
PASO 4 — SOLICITAR FECHA Y TIPO DE PROPIEDAD: Si no se han mencionado, pregunta por la fecha/hora preferida y el tipo de propiedad (APARTAMENTO o LOCAL).
PASO 5 — INVOCAR 'agendar_cita': Solo cuando tengas TODOS los datos anteriores, invoca la herramienta con los campos: emailCliente, telefonoCliente, nombreCliente, fecha, tipoPropiedad y notas.

RESPUESTAS SEGÚN RESULTADO DE LA HERRAMIENTA:
- Si el resultado es CITA_EXISTENTE: Informa al cliente que ya tiene una cita agendada en esa fecha y que un asesor comercial lo contactará a la brevedad por los medios proporcionados.
- Si el resultado es CITA_VENCIDA: Informa que encontraste una cita anterior que ya venció y pregunta si desea reagendarla. Si acepta, invoca nuevamente 'agendar_cita' con el campo reagendar: true y la nueva fecha.
- Si el resultado es INVALID_EMAIL: Informa que el correo no es válido y solicita uno correcto.
- Si el resultado es SUCCESS: Felicita al cliente e informa la fecha confirmada.

NOTAS EN EL CAMPO 'notas': Redacta un RESUMEN EJECUTIVO de la conversación incluyendo:
- Interés principal (tipo de apartamento/local, áreas, habitaciones).
- Propósito (vivienda propia, familiar, negocio o inversión).
- Perfil profesional/ocupación del cliente si fue mencionado.
- Requerimientos y dudas planteadas.`;

  const optionsTime = { timeZone: 'America/Caracas', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', weekday: 'long' } as const;
  const currentDateTime = new Date().toLocaleString('es-VE', optionsTime);
  const timeContext = `\n[CONTEXTO DE TIEMPO REAL]\nLa fecha y hora actual en Venezuela es: ${currentDateTime}. Ten en cuenta esta fecha y hora al agendar citas o hablar sobre el tiempo con el cliente.`;

  const fullSystemInstruction = `${basePrompt}\n\n${userContext}${citaInstruction}${timeContext}\nUbicación actual en la web: ${project === 'BUCARE_PLAZA' ? 'Bucare Plaza Comercial' : 'Bucare Suite Apartamentos'}.`;

  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: fullSystemInstruction }],
    },
    {
      role: 'model',
      parts: [{ text: 'Entendido. Estoy listo para atender al cliente, generar resúmenes ejecutivos detallados del perfil y agendar citas automáticamente.' }],
    },
  ];

  for (const msg of history) {
    contents.push({
      role: msg.sender === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  let preferredModel = (selectedModel || 'gemini-3.5-flash').replace(/^models\//, '');
  // Filtrar modelos deprecados que puedan venir de la base de datos
  const deprecatedModels = ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  if (deprecatedModels.includes(preferredModel)) {
    preferredModel = 'gemini-3.5-flash';
  }

  // Modelos vigentes
  const fallbackModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-pro'];
  
  // Si autoRotateModel está activado, intentamos todos los modelos; si está desactivado, solo el preferido
  const models = options.autoRotateModel !== false
    ? Array.from(new Set([preferredModel, ...fallbackModels]))
    : [preferredModel];

  let attempts = 0;
  const maxAttempts = API_KEYS.length * models.length;

  while (attempts < maxAttempts) {
    const currentKey = getActiveKey();
    const model = models[attempts % models.length];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          tools: [AGENDAR_CITA_TOOL],
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const candidate = data?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const parts = candidate?.content?.parts;
        const part = parts?.[0];

        // Detectar respuesta vacía: sin parts, parts vacías, o finishReason que indica error de output
        const hasValidContent = part?.text || part?.functionCall;
        const isEmptyOutput =
          !candidate ||
          !parts ||
          parts.length === 0 ||
          !hasValidContent ||
          finishReason === 'OTHER' ||
          finishReason === 'PROHIBITED_CONTENT' ||
          finishReason === 'BLOCKLIST' ||
          finishReason === 'SPII';

        if (isEmptyOutput) {
          console.warn(
            `[GeminiService] Respuesta vacía o inválida del modelo ${model} (Key:${activeKeyIndex}, finishReason:${finishReason ?? 'none'}). Rotando...`
          );
          rotateKey();
          attempts++;
          continue;
        }

        // Si el modelo actual es diferente al preferido y funcionó, y la rotación está activa,
        // ajustamos el modelo en base de datos para futuras consultas
        if (options.autoRotateModel !== false && model !== preferredModel) {
          try {
            await prisma.aiConfig.update({
              where: { project },
              data: { selectedModel: model },
            });
            console.log(`[GeminiService] Auto-ajustado modelo activo para ${project} a: ${model}`);
          } catch (dbErr) {
            console.error('[GeminiService] Error al actualizar modelo en DB:', dbErr);
          }
        }

        // 1. Si Gemini decidió invocar la función agendar_cita
        if (part?.functionCall) {
          const fnCall = part.functionCall;
          if (fnCall.name === 'agendar_cita') {
            const resultStr = await executeAgendarCita(fnCall.args, options);
            const resultObj = JSON.parse(resultStr);

            if (resultObj.status === 'SUCCESS') {
              const accion = resultObj.reagendada ? 'reagendada' : 'agendada';
              return `¡Excelente! Tu cita para visitar ${project === 'BUCARE_PLAZA' ? 'Bucare Plaza Comercial' : 'Bucare Suite Apartamentos'} ha sido ${accion} con éxito en nuestro sistema para el **${resultObj.fechaFormateada}**.\n\nTe contactaremos por:\n📧 Correo: ${resultObj.emailCliente}\n📞 Teléfono: ${resultObj.telefonoCliente || 'No registrado'}\n\nUn asesor comercial se pondrá en contacto contigo para confirmar los detalles. ¡Gracias!`;
            } else if (resultObj.status === 'CITA_EXISTENTE') {
              return `${resultObj.mensaje}\n\nSi necesitas cambiar algo, no dudes en indicármelo. 😊`;
            } else if (resultObj.status === 'CITA_VENCIDA') {
              return `${resultObj.mensaje}\n\nEscríbeme "Sí, reagenda" o dime la nueva fecha que prefieres.`;
            } else if (resultObj.status === 'INVALID_EMAIL') {
              return `${resultObj.mensaje}\n\n¿Podrías proporcionarme tu correo electrónico correcto?`;
            } else {
              return 'Tu solicitud de cita ha sido recibida. Un asesor comercial se pondrá en contacto contigo para confirmar la fecha disponible.';
            }
          }
        }

        // 2. Si Gemini respondió con texto normal
        const text = part?.text;
        if (text) {
          return text.trim();
        }

        // Fallback de seguridad: si llegamos aquí sin texto ni functionCall, rotar
        console.warn(`[GeminiService] Part sin texto ni functionCall en modelo ${model}. Rotando...`);
        rotateKey();
      } else {
        const errorText = await response.text();
        console.error(`[GeminiService] Error HTTP ${response.status} de Gemini API (Modelo: ${model}, Key Index: ${activeKeyIndex}):`, errorText);

        // Detectar errores específicos de cuota/output vacío para siempre rotar
        const isQuotaOrOutputError =
          response.status === 429 ||
          response.status === 503 ||
          errorText.includes('RESOURCE_EXHAUSTED') ||
          errorText.includes('model output') ||
          errorText.includes('quota') ||
          errorText.includes('overloaded');

        if (isQuotaOrOutputError) {
          console.warn(`[GeminiService] Error de cuota/output detectado. Rotando key...`);
        }
        rotateKey();
      }
    } catch (err) {
      console.error(`[GeminiService] Error en intento ${attempts + 1}:`, err);
      rotateKey();
    }

    attempts++;
  }

  return 'En este momento estamos experimentando una alta demanda de consultas. Un asesor comercial responderá a tu mensaje a la brevedad.';
}
