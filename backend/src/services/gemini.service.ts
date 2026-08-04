import { prisma } from '../config/database.config.js';

/**
 * Servicio de IA Gemini con Pool de API Keys, Rotación Inteligente, Selección Dinámica de Modelos,
 * Gestión de Nombre de Cliente y Agendamiento Automático de Citas con Resumen Ejecutivo Detallado mediante Function Calling.
 */

const API_KEYS = [
  'AQ.Ab8RN6LGqcVKgrq7XVj8N_Mb7t2zkLAD3QQNWXY3ePFpfE0bvA',
  'AQ.Ab8RN6J7Qqv2VUpDOvOvALYTsssf01V3LAZM0aO3KLgLlCxDSQ',
  'AQ.Ab8RN6KMFJyODHPORpXB9h8h40bXzTl5nZ4kxtNAwlu9pCKQaA',
  'AQ.Ab8RN6L6K1EwzNtplwT3IV1dUgbUNw-CXd2I6Ym_8Vt12wQT_g',
];

let activeKeyIndex = 0;

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
  BUCARE_SUITE: `Eres el Asistente Virtual Inteligente de Bucare Suite (Residencias de Lujo en San Cristóbal, Nueva Guayana).
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
      description: 'Crea y agenda automáticamente una cita de visita en la base de datos para Bucare Suite (APARTAMENTO) o Bucare Plaza (LOCAL).',
      parameters: {
        type: 'OBJECT',
        properties: {
          fecha: {
            type: 'STRING',
            description: 'Fecha y hora aproximada de la cita en formato YYYY-MM-DD HH:mm (ej. 2026-08-10 10:00 o 2026-08-07 15:30)',
          },
          tipoPropiedad: {
            type: 'STRING',
            enum: ['APARTAMENTO', 'LOCAL'],
            description: 'Tipo de propiedad a visitar (APARTAMENTO para Bucare Suite, LOCAL para Bucare Plaza)',
          },
          notas: {
            type: 'STRING',
            description: 'RESUMEN EJECUTIVO COMPLETO DE LA CONVERSACIÓN. Debe detallar: 1) Interés principal y modelo o espacio buscado, 2) Propósito de adquisición (vivienda personal, familiar, local comercial o inversión), 3) Requerimientos o dudas manifestadas, 4) Perfil profesional / laboral / empresa / cargo del cliente si fue mencionado en el chat para evaluar capacidad de adquisición.',
          },
          nombreCliente: {
            type: 'STRING',
            description: 'Nombre completo del cliente si es invitado no registrado',
          },
          contactoCliente: {
            type: 'STRING',
            description: 'Correo electrónico o número de teléfono del cliente',
          },
        },
        required: ['fecha', 'tipoPropiedad', 'notas'],
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
    { id: 'gemini-2.0-flash', name: 'models/gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.5-flash', name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
    { id: 'gemini-1.5-flash', name: 'models/gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
  ];
}

/**
 * Maneja la ejecución de la función `agendar_cita` creando la cita en Prisma DB.
 */
async function executeAgendarCita(args: any, options: GenerateAiOptions): Promise<string> {
  try {
    const { userId, userFullName, userEmail, guestName, project } = options;

    let parsedDate = new Date(args.fecha);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    let clientRefId = userId;

    if (!clientRefId) {
      const clientContact = args.contactoCliente || userEmail;
      if (clientContact) {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email: clientContact }, { phoneNumber: clientContact }],
          },
        });
        if (existingUser) {
          clientRefId = existingUser.id;
        }
      }
      if (!clientRefId) {
        const firstUser = await prisma.user.findFirst();
        clientRefId = firstUser?.id || 'invitado-chat';
      }
    }

    const clientName = userFullName || guestName || args.nombreCliente || 'Cliente Chat';
    const clientContact = userEmail || args.contactoCliente || 'Contacto por Chat';

    const executiveNotes = args.notas
      ? args.notas.trim()
      : `Cliente: ${clientName} (${clientContact}). Agendado vía IA Chat.`;

    const createdCita = await prisma.cita.create({
      data: {
        clienteId: clientRefId,
        fecha: parsedDate,
        tipoPropiedad: args.tipoPropiedad || (project === 'BUCARE_PLAZA' ? 'LOCAL' : 'APARTAMENTO'),
        estado: 'PROGRAMADA',
        notas: executiveNotes,
      },
    });

    const dateFormatted = parsedDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    console.log(`[GeminiService] Cita agendada con éxito ID: ${createdCita.id} para ${clientName} fecha: ${dateFormatted}`);

    return JSON.stringify({
      status: 'SUCCESS',
      citaId: createdCita.id,
      fechaFormateada: dateFormatted,
      tipoPropiedad: createdCita.tipoPropiedad,
      mensaje: `Cita registrada con éxito en el sistema para el ${dateFormatted}.`,
    });
  } catch (err: any) {
    console.error('[GeminiService] Error al ejecutar agendar_cita:', err);
    return JSON.stringify({
      status: 'ERROR',
      mensaje: 'Hubo un inconveniente temporal al registrar la cita en la base de datos.',
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

  const citaInstruction = `\n[AGENDAMIENTO AUTOMÁTICO DE CITAS Y GENERACIÓN DE RESUMEN EJECUTIVO DE NOTAS]
Tienes la capacidad de agendar citas automáticamente en el sistema usando la herramienta 'agendar_cita'.
Cuando el cliente exprese que desea agendar una cita, visita o inspección a Bucare Suite o Bucare Plaza:
1. Si falta la fecha u hora deseada o la preferencia de propiedad, pídela amablemente en la conversación.
2. Al invocar 'agendar_cita', DEBES REDACTAR OBLIGATORIAMENTE EN EL ARGUMENTO 'notas' UN RESUMEN EJECUTIVO COMPLETO Y ESTRUCTURADO de la conversación que analice y sintetice:
   - Interés principal: Qué tipo de apartamento o local busca, áreas, habitaciones o acabado deseado.
   - Uso / Propósito: Si es para vivienda propia, para su familia, negocio/local comercial o inversión.
   - Perfil Profesional / Ocupación: Si el cliente mencionó su trabajo, profesión, negocio, empresa o cargo para evaluar su perfil y capacidad de adquisición.
   - Requerimientos especiales y dudas: Requerimientos adicionales o inquietudes planteadas por el cliente.`;

  const fullSystemInstruction = `${basePrompt}\n\n${userContext}${citaInstruction}\nUbicación actual en la web: ${project === 'BUCARE_PLAZA' ? 'Bucare Plaza Comercial' : 'Bucare Suite Residencial'}.`;

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

  const preferredModel = (selectedModel || 'gemini-2.0-flash').replace(/^models\//, '');
  const fallbackModels = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  const models = Array.from(new Set([preferredModel, ...fallbackModels]));

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
        const part = candidate?.content?.parts?.[0];

        // 1. Si Gemini decidió invocar la función agendar_cita
        if (part?.functionCall) {
          const fnCall = part.functionCall;
          if (fnCall.name === 'agendar_cita') {
            const resultStr = await executeAgendarCita(fnCall.args, options);
            const resultObj = JSON.parse(resultStr);

            if (resultObj.status === 'SUCCESS') {
              return `¡Excelente! Tu cita para visitar ${project === 'BUCARE_PLAZA' ? 'Bucare Plaza Comercial' : 'Bucare Suite Residencial'} ha sido agendada con éxito en nuestro sistema para el ${resultObj.fechaFormateada}.\n\nUn asesor comercial se pondrá en contacto contigo para confirmar los detalles.`;
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
      } else {
        const errorText = await response.text();
        console.error(`[GeminiService] Error HTTP ${response.status} de Gemini API (Modelo: ${model}, Key Index: ${activeKeyIndex}):`, errorText);
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
