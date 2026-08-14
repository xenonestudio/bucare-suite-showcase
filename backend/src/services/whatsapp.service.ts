import crypto from 'crypto';
import { prisma } from '../config/database.config.js';
import { generateGeminiResponse } from './gemini.service.js';

class WhatsAppService {
  private activeSessionId: string = process.env.WHATSAPP_PHONE || '584247731176';
  private isInitializing: boolean = false;

  // Runtime-configurable alert webhook (set via admin panel, persisted in memory with env fallback)
  private alertWebhookUrl: string = process.env.WHATSAPP_ALERT_WEBHOOK_URL || '';
  private alertWebhookSecret: string = process.env.WHATSAPP_ALERT_WEBHOOK_SECRET || '';

  constructor() {
    this.seedDemoData().catch((err) =>
      console.error('[WhatsAppService] Error en auto-conexión por defecto:', err)
    );
  }

  public getWebhookConfig() {
    return {
      alertWebhookUrl: this.alertWebhookUrl,
      alertWebhookSecret: this.alertWebhookSecret ? '***configured***' : '',
      incomingWebhookPath: '/api/v1/whatsapp/webhook',
    };
  }

  public setWebhookConfig(alertUrl: string, alertSecret?: string) {
    this.alertWebhookUrl = alertUrl || '';
    if (alertSecret !== undefined) {
      this.alertWebhookSecret = alertSecret;
    }
    console.log(`[WhatsAppService] Webhook de alertas configurado: ${this.alertWebhookUrl || '(desactivado)'}`);
  }

  public async initialize(phone?: string): Promise<void> {
    const sessionPhone = phone ? phone.replace(/[^0-9]/g, '') : (process.env.WHATSAPP_PHONE || '584247731176');
    this.activeSessionId = sessionPhone;
    console.log(`[WhatsAppService] Inicializando sesión de API externa para el número: +${sessionPhone}...`);
    
    this.isInitializing = true;
    try {
      await this.seedDemoData();
      console.log(`[WhatsAppService] Sesión externa +${sessionPhone} configurada correctamente.`);
    } catch (error) {
      console.error('[WhatsAppService] Error en inicialización externa:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  public async disconnect(): Promise<void> {
    console.log(`[WhatsAppService] Desconectando sesión +${this.activeSessionId}.`);
    this.activeSessionId = '';
  }

  public async getStatus() {
    return {
      connected: this.activeSessionId !== '',
      initializing: this.isInitializing,
      phone: this.activeSessionId || null,
      qrCode: null,
      qrAscii: null,
      provider: 'EXTERNAL_API',
    };
  }

  public async restart(): Promise<void> {
    console.log('[WhatsAppService] Reiniciando conexión externa...');
    const currentPhone = this.activeSessionId;
    await this.disconnect();
    await this.initialize(currentPhone);
  }

  public async getChats() {
    return prisma.whatsAppChat.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        contact: true,
      },
    });
  }

  public async getContacts() {
    return prisma.whatsAppContact.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async getChatMessages(chatId: string) {
    return prisma.whatsAppMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async syncChatMessages(chatId: string): Promise<{ synced: number; total: number }> {
    // 1. Obtener el chat y su teléfono de contacto
    const chat = await prisma.whatsAppChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error(`Chat con id "${chatId}" no encontrado.`);
    }

    const jid = `${chat.contactPhone}@s.whatsapp.net`;

    // 2. Llamar a la API externa: GET /api/chats/:jid/messages
    const apiToken = process.env.WHATSAPP_API_TOKEN || '';
    const sendUrl = process.env.WHATSAPP_API_URL || 'https://whatsapp.lexsank.xyz/api/messages/send';
    const baseUrl = sendUrl.replace(/\/messages\/send\/?$/, '');
    const messagesUrl = `${baseUrl}/chats/${encodeURIComponent(jid)}/messages`;

    console.log(`[WhatsAppService] Sincronizando mensajes del chat ${chatId} desde: ${messagesUrl}`);

    const response = await fetch(messagesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API externa retornó error ${response.status}: ${errorText}`);
    }

    const externalMessages = await response.json() as Array<{
      id: string;
      jid: string;
      text: string;
      fromMe: boolean;
      timestamp: number;
      local_timestamp?: number;
    }>;

    console.log(`[WhatsAppService] Recibidos ${externalMessages.length} mensajes externos para chat ${chatId}.`);

    // 3. Upsert cada mensaje usando externalId para evitar duplicados
    let syncedCount = 0;
    for (const extMsg of externalMessages) {
      if (!extMsg.text || !extMsg.id) continue;

      const sender: 'USER' | 'ADMIN' = extMsg.fromMe ? 'ADMIN' : 'USER';
      const createdAt = new Date((extMsg.local_timestamp ?? extMsg.timestamp) * 1000);

      // Upsert: si ya existe el externalId en este chat, no crear duplicado
      const existing = await prisma.whatsAppMessage.findUnique({
        where: { chatId_externalId: { chatId, externalId: extMsg.id } },
      });

      if (!existing) {
        await prisma.whatsAppMessage.create({
          data: {
            chatId,
            externalId: extMsg.id,
            sender,
            content: extMsg.text.trim(),
            createdAt,
          },
        });
        syncedCount++;
      }
    }

    // 4. Actualizar el lastMessage del chat si hay mensajes nuevos
    if (externalMessages.length > 0) {
      const lastExt = externalMessages[externalMessages.length - 1];
      if (lastExt.text) {
        await prisma.whatsAppChat.update({
          where: { id: chatId },
          data: { lastMessage: lastExt.text.trim(), updatedAt: new Date() },
        });
      }
    }

    console.log(`[WhatsAppService] Sincronización de mensajes finalizada: ${syncedCount} nuevos de ${externalMessages.length} totales.`);
    return { synced: syncedCount, total: externalMessages.length };
  }

  public async sendTextMessage(phone: string, text: string, sender: 'ADMIN' | 'AI' = 'ADMIN'): Promise<{ success: boolean; externalId?: string }> {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const jid = `${cleanPhone}@s.whatsapp.net`;
      console.log(`[WhatsAppService] Enviando mensaje a ${jid}: "${text}"`);

      // 1. Enviar vía API externa PRIMERO
      const apiUrl = process.env.WHATSAPP_API_URL || 'https://whatsapp.lexsank.xyz/api/messages/send';
      const apiToken = process.env.WHATSAPP_API_TOKEN || '';

      console.log(`[WhatsAppService] POST a ${apiUrl} — JID: ${jid}`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jid, text: text.trim() }),
      });

      // 2. Parsear JSON y verificar success:true
      const responseJson = await response.json().catch(() => null) as { success?: boolean; id?: string } | null;

      if (!response.ok || !responseJson?.success) {
        console.error(`[WhatsAppService] API retornó error ${response.status}:`, responseJson);
        return { success: false };
      }

      const externalMessageId = responseJson.id || null;
      console.log(`[WhatsAppService] Mensaje enviado. ID externo: ${externalMessageId}`);

      // 3. Upsert chat y contacto
      let chat = await prisma.whatsAppChat.findUnique({ where: { contactPhone: cleanPhone } });

      if (!chat) {
        const contact = await prisma.whatsAppContact.findUnique({ where: { phoneNumber: cleanPhone } });
        chat = await prisma.whatsAppChat.create({
          data: {
            contactPhone: cleanPhone,
            contactName: contact?.name || `Cliente +${cleanPhone}`,
            contactId: contact?.id || null,
          },
        });
      }

      // 4. Guardar mensaje localmente con externalId para evitar duplicados en syncs futuros
      await prisma.whatsAppMessage.create({
        data: {
          chatId: chat.id,
          externalId: externalMessageId,
          sender,
          content: text.trim(),
        },
      });

      await prisma.whatsAppChat.update({
        where: { id: chat.id },
        data: { lastMessage: text.trim(), updatedAt: new Date() },
      });

      // 5. Disparar alerta webhook si está configurada
      this.forwardEventToAlertWebhook('message.sent', {
        phone: cleanPhone,
        sender,
        content: text.trim(),
        externalId: externalMessageId,
      }).catch((err) => console.error('[WhatsAppService] Error enviando alerta de envío:', err));

      return { success: true, externalId: externalMessageId ?? undefined };
    } catch (err) {
      console.error(`[WhatsAppService] Error enviando mensaje a +${phone}:`, err);
      return { success: false };
    }
  }

  public async sendAppointmentNotification(
    phone: string,
    citaDetails: { fecha: string; tipoPropiedad: string; notas?: string }
  ): Promise<boolean> {
    if (!phone) return false;
    const formattedProp =
      citaDetails.tipoPropiedad === 'LOCAL'
        ? 'Bucare Plaza (Local Comercial)'
        : 'Bucare Suite (Apartamento de Lujo)';
    const msg = `Confirmación de Cita - Bucare Suite & Plaza\n\n¡Hola! Tu cita para ${formattedProp} ha sido agendada.\n\nFecha y Hora: ${citaDetails.fecha}\nNotas: ${citaDetails.notas || 'Visita guiada comercial'}\n\nUbicación: QQJC+93C, Av. Principal, San Cristóbal, Nueva Guayana.\n\nSi requieres modificar o cancelar, responde este mensaje.`;
    const result = await this.sendTextMessage(phone, msg, 'ADMIN');
    return result.success;
  }


  public async receiveMessageSimulation(contactPhone: string, text: string): Promise<void> {
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '');

    let contact = await prisma.whatsAppContact.findUnique({
      where: {
        phoneNumber: cleanPhone,
      },
    });

    if (!contact) {
      contact = await prisma.whatsAppContact.create({
        data: {
          phoneNumber: cleanPhone,
          name: `Cliente +${cleanPhone}`,
        },
      });
    }

    let chat = await prisma.whatsAppChat.findUnique({
      where: {
        contactPhone: cleanPhone,
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!chat) {
      chat = await prisma.whatsAppChat.create({
        data: {
          contactPhone: cleanPhone,
          contactName: contact.name,
          contactId: contact.id,
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    }

    await prisma.whatsAppMessage.create({
      data: {
        chatId: chat.id,
        sender: 'USER',
        content: text.trim(),
      },
    });

    await prisma.whatsAppChat.update({
      where: { id: chat.id },
      data: { lastMessage: text.trim(), updatedAt: new Date() },
    });

    if (chat.isAiActive) {
      try {
        const customConfig = await prisma.aiConfig.findFirst({
          where: { project: 'BUCARE_SUITE' },
        });

        const historyFormatted = chat.messages.map((m: any) => ({
          sender: m.sender as 'USER' | 'AI' | 'ADMIN',
          content: m.content,
        }));

        historyFormatted.push({ sender: 'USER', content: text.trim() });

        const aiResponseContent = await generateGeminiResponse({
          isAuthenticated: false,
          guestName: contact.name || undefined,
          project: 'BUCARE_SUITE',
          systemPrompt: customConfig?.systemPrompt,
          selectedModel: customConfig?.selectedModel || undefined,
          autoRotateModel: customConfig ? customConfig.autoRotateModel : true,
          history: historyFormatted,
          userMessage: text.trim(),
        });

        await prisma.whatsAppMessage.create({
          data: {
            chatId: chat.id,
            sender: 'AI',
            content: aiResponseContent,
          },
        });

        await prisma.whatsAppChat.update({
          where: { id: chat.id },
          data: { lastMessage: aiResponseContent, updatedAt: new Date() },
        });

      } catch (err) {
        console.error('[WhatsAppService Simulation] Error en respuesta de IA:', err);
      }
    }
  }

  public async toggleAi(chatId: string, isAiActive: boolean) {
    return prisma.whatsAppChat.update({
      where: { id: chatId },
      data: { isAiActive },
    });
  }

  private async seedDemoData(): Promise<void> {
    const count = await prisma.whatsAppContact.count();
    if (count > 0) return;

    console.log('[WhatsAppService] Sembrando datos de prueba globales de WhatsApp...');

    const c1 = await prisma.whatsAppContact.create({
      data: { phoneNumber: '584245551111', name: 'María Delgado (Bucare Suite)' },
    });
    const c2 = await prisma.whatsAppContact.create({
      data: { phoneNumber: '584245552222', name: 'Juan Pérez (Interesado Mirador)' },
    });
    const c3 = await prisma.whatsAppContact.create({
      data: { phoneNumber: '584246663333', name: 'Carlos Sosa (Inversionista)' },
    });

    const chat1 = await prisma.whatsAppChat.create({
      data: {
        contactPhone: c1.phoneNumber,
        contactName: c1.name,
        contactId: c1.id,
        lastMessage: '¿Cuál es el precio de la Suite Mirador?',
      },
    });
    await prisma.whatsAppMessage.createMany({
      data: [
        { chatId: chat1.id, sender: 'USER', content: 'Hola, me interesa información sobre Bucare Suite.', createdAt: new Date(Date.now() - 3600000) },
        { chatId: chat1.id, sender: 'AI', content: '¡Hola! Qué gusto saludarte. En Bucare Suite contamos con apartamentos de lujo que redefinen la exclusividad. ¿Te gustaría conocer los planos o los precios?', createdAt: new Date(Date.now() - 1800000) },
        { chatId: chat1.id, sender: 'USER', content: '¿Cuál es el precio de la Suite Mirador?', createdAt: new Date(Date.now() - 900000) },
      ],
    });

    const chat2 = await prisma.whatsAppChat.create({
      data: {
        contactPhone: c2.phoneNumber,
        contactName: c2.name,
        contactId: c2.id,
        lastMessage: 'Excelente, estaré puntual a las 4:00 PM.',
      },
    });
    await prisma.whatsAppMessage.createMany({
      data: [
        { chatId: chat2.id, sender: 'USER', content: 'Quiero agendar una visita guiada.', createdAt: new Date(Date.now() - 3600000) },
        { chatId: chat2.id, sender: 'ADMIN', content: 'Hola Juan, con gusto. ¿Te parece el miércoles a las 4:00 PM?', createdAt: new Date(Date.now() - 1800000) },
        { chatId: chat2.id, sender: 'USER', content: 'Excelente, estaré puntual a las 4:00 PM.', createdAt: new Date(Date.now() - 900000) },
      ],
    });

    const chat3 = await prisma.whatsAppChat.create({
      data: {
        contactPhone: c3.phoneNumber,
        contactName: c3.name,
        contactId: c3.id,
        lastMessage: '¿Tienen financiamiento para los locales comerciales?',
      },
    });
    await prisma.whatsAppMessage.createMany({
      data: [
        { chatId: chat3.id, sender: 'USER', content: 'Buenas tardes. Quisiera información de los locales comerciales en Bucare Plaza.', createdAt: new Date(Date.now() - 3600000) },
        { chatId: chat3.id, sender: 'AI', content: '¡Hola! Bienvenido a Bucare Plaza Comercial. Contamos con locales comerciales ideales para franquicias y consultorios en la mejor ubicación. ¿Tienen financiamiento para los locales comerciales?', createdAt: new Date(Date.now() - 1800000) },
      ],
    });
  }

  public async updateContact(contactId: string, data: {
    name?: string;
    avatarUrl?: string;
    birthDate?: string | null;
    email?: string;
    company?: string;
    notes?: string;
  }) {
    const parsedBirthDate = data.birthDate ? new Date(data.birthDate) : null;
    
    const updated = await prisma.whatsAppContact.update({
      where: { id: contactId },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
        birthDate: parsedBirthDate,
        email: data.email,
        company: data.company,
        notes: data.notes,
      },
    });

    if (data.name) {
      await prisma.whatsAppChat.updateMany({
        where: { contactId },
        data: { contactName: data.name },
      });
    }

    return updated;
  }

  public async exportContactsToVCF(): Promise<string> {
    const contacts = await prisma.whatsAppContact.findMany();

    let vcfString = '';
    for (const c of contacts) {
      vcfString += 'BEGIN:VCARD\n';
      vcfString += 'VERSION:3.0\n';
      if (c.name) vcfString += `FN:${c.name}\n`;
      vcfString += `TEL;TYPE=CELL:+${c.phoneNumber}\n`;
      if (c.email) vcfString += `EMAIL:${c.email}\n`;
      if (c.company) vcfString += `ORG:${c.company}\n`;
      if (c.notes) vcfString += `NOTE:${c.notes}\n`;
      if (c.birthDate) {
        const bdayStr = new Date(c.birthDate).toISOString().split('T')[0];
        vcfString += `BDAY:${bdayStr}\n`;
      }
      vcfString += 'END:VCARD\n';
    }
    return vcfString;
  }

  public async importContactsFromVCF(vcfContent: string): Promise<number> {
    const cards = vcfContent.split('BEGIN:VCARD');
    let importedCount = 0;

    for (const card of cards) {
      if (!card.includes('END:VCARD')) continue;

      let name = '';
      let phone = '';
      let email = '';
      let company = '';
      let notes = '';
      let birthDate: Date | null = null;

      const lines = card.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('FN:')) {
          name = trimmed.substring(3).trim();
        } else if (trimmed.startsWith('TEL')) {
          const parts = trimmed.split(':');
          if (parts.length > 1) {
            phone = parts[1].replace(/[^0-9]/g, '');
          }
        } else if (trimmed.startsWith('EMAIL:')) {
          email = trimmed.substring(6).trim();
        } else if (trimmed.startsWith('ORG:')) {
          company = trimmed.substring(4).trim();
        } else if (trimmed.startsWith('NOTE:')) {
          notes = trimmed.substring(5).trim();
        } else if (trimmed.startsWith('BDAY:')) {
          const bdayVal = trimmed.substring(5).trim();
          const d = new Date(bdayVal);
          if (!isNaN(d.getTime())) {
            birthDate = d;
          }
        }
      }

      if (!phone) continue;

      await prisma.whatsAppContact.upsert({
        where: {
          phoneNumber: phone,
        },
        create: {
          phoneNumber: phone,
          name: name || `Importado +${phone}`,
          email: email || null,
          company: company || null,
          notes: notes || null,
          birthDate: birthDate,
        },
        update: {
          name: name || undefined,
          email: email || undefined,
          company: company || undefined,
          notes: notes || undefined,
          birthDate: birthDate || undefined,
        },
      });

      importedCount++;
    }

    return importedCount;
  }

  public async handleIncomingWebhook(payload: any): Promise<void> {
    const { event, data } = payload;
    if (event !== 'messages.upsert') {
      console.log(`[WhatsAppService] Ignorando evento no soportado: ${event}`);
      return;
    }

    const { jid, pushName, message } = data;
    if (!jid || !message) {
      console.warn('[WhatsAppService] Webhook payload inválido o incompleto:', payload);
      return;
    }

    // Obtener texto del mensaje (conversación directa o mensaje de texto extendido)
    const text = message.conversation || message.extendedTextMessage?.text;
    if (!text) {
      console.log('[WhatsAppService] El mensaje recibido no contiene texto legible (conversación), ignorando.');
      return;
    }

    const cleanPhone = jid.split('@')[0].replace(/[^0-9]/g, '');
    console.log(`[WhatsAppService] Webhook: procesando mensaje de +${cleanPhone}: "${text}"`);

    let contact = await prisma.whatsAppContact.findUnique({
      where: {
        phoneNumber: cleanPhone,
      },
    });

    if (!contact) {
      contact = await prisma.whatsAppContact.create({
        data: {
          phoneNumber: cleanPhone,
          name: pushName || `Cliente +${cleanPhone}`,
        },
      });
    }

    let chat = await prisma.whatsAppChat.findUnique({
      where: {
        contactPhone: cleanPhone,
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!chat) {
      chat = await prisma.whatsAppChat.create({
        data: {
          contactPhone: cleanPhone,
          contactName: contact.name,
          contactId: contact.id,
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    }

    // Registrar el mensaje del usuario entrante
    await prisma.whatsAppMessage.create({
      data: {
        chatId: chat.id,
        sender: 'USER',
        content: text.trim(),
      },
    });

    await prisma.whatsAppChat.update({
      where: { id: chat.id },
      data: { lastMessage: text.trim(), updatedAt: new Date() },
    });

    // ── Notificación Push al equipo por nuevo mensaje de WhatsApp del cliente ──
    try {
      const senderLabel = contact.name || `WhatsApp +${cleanPhone}`;
      const { sendEventNotification } = await import('../modules/notifications/notifications.routes.js');
      sendEventNotification(
        'chat.message',
        'Nuevo WhatsApp de Cliente 💬',
        `${senderLabel}: "${text.trim().substring(0, 50)}${text.trim().length > 50 ? '...' : ''}"`,
        `/dashboard/chat?phone=${cleanPhone}`
      ).catch(e => console.error('[WhatsAppService] Error enviando push chat.message (WA):', e));
    } catch (err) {
      console.error('[WhatsAppService] Failed to import sendEventNotification:', err);
    }


    // Enviar alerta de mensaje entrante recibido
    this.forwardEventToAlertWebhook('message.received', {
      phone: cleanPhone,
      sender: 'USER',
      content: text.trim(),
    }).catch((err) => console.error('[WhatsAppService] Error enviando alerta de recepción:', err));

    // Responder automáticamente si la IA está activa para este chat
    if (chat.isAiActive) {
      try {
        const customConfig = await prisma.aiConfig.findFirst({
          where: { project: 'BUCARE_SUITE' },
        });

        const historyFormatted = chat.messages.map((m: any) => ({
          sender: m.sender as 'USER' | 'AI' | 'ADMIN',
          content: m.content,
        }));

        historyFormatted.push({ sender: 'USER', content: text.trim() });

        const aiResponseContent = await generateGeminiResponse({
          isAuthenticated: false,
          guestName: contact.name || undefined,
          project: 'BUCARE_SUITE',
          systemPrompt: customConfig?.systemPrompt,
          selectedModel: customConfig?.selectedModel || undefined,
          autoRotateModel: customConfig ? customConfig.autoRotateModel : true,
          history: historyFormatted,
          userMessage: text.trim(),
        });

        // Enviar respuesta REAL al usuario
        await this.sendTextMessage(cleanPhone, aiResponseContent, 'AI');

      } catch (err) {
        console.error('[WhatsAppService Webhook] Error en respuesta de IA:', err);
      }
    }
  }

  public async syncExternalChats(): Promise<number> {
    try {
      const apiToken = process.env.WHATSAPP_API_TOKEN || '';
      const sendUrl = process.env.WHATSAPP_API_URL || 'https://whatsapp.lexsank.xyz/api/messages/send';
      // Extraer url base (removiendo /messages/send o /messages/send/)
      const baseUrl = sendUrl.replace(/\/messages\/send$/, '').replace(/\/messages\/send\/$/, '');
      const chatsUrl = `${baseUrl}/chats`;

      console.log(`[WhatsAppService] Sincronizando chats desde API externa: ${chatsUrl}...`);

      const response = await fetch(chatsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API externa retornó error ${response.status}: ${errorText}`);
      }

      const externalChats = await response.json() as Array<{
        id: string;
        name?: string;
        lastMessage?: string;
        phone?: string;
        avatar?: string;
      }>;

      console.log(`[WhatsAppService] Recibidos ${externalChats.length} chats desde la API.`);

      let syncedCount = 0;
      for (const extChat of externalChats) {
        const cleanPhone = extChat.phone ? extChat.phone.replace(/[^0-9]/g, '') : extChat.id.split('@')[0].replace(/[^0-9]/g, '');
        if (!cleanPhone) continue;

        // Upsert contacto
        const contact = await prisma.whatsAppContact.upsert({
          where: { phoneNumber: cleanPhone },
          create: {
            phoneNumber: cleanPhone,
            name: extChat.name || `Cliente +${cleanPhone}`,
            avatarUrl: extChat.avatar || null,
          },
          update: {
            name: extChat.name || undefined,
            avatarUrl: extChat.avatar || undefined,
          },
        });

        // Upsert chat
        const chat = await prisma.whatsAppChat.upsert({
          where: { contactPhone: cleanPhone },
          create: {
            contactPhone: cleanPhone,
            contactName: contact.name,
            contactId: contact.id,
            lastMessage: extChat.lastMessage || null,
          },
          update: {
            contactName: contact.name,
            lastMessage: extChat.lastMessage || undefined,
            updatedAt: new Date(),
          },
        });

        // Crear mensaje en historial si no existe
        if (extChat.lastMessage) {
          const hasMessages = await prisma.whatsAppMessage.count({
            where: { chatId: chat.id },
          });
          if (hasMessages === 0) {
            await prisma.whatsAppMessage.create({
              data: {
                chatId: chat.id,
                sender: 'USER',
                content: extChat.lastMessage.trim(),
              },
            });
          }
        }

        syncedCount++;
      }

      console.log(`[WhatsAppService] Sincronización finalizada: ${syncedCount} chats actualizados.`);
      return syncedCount;
    } catch (err) {
      console.error('[WhatsAppService] Error sincronizando chats externos:', err);
      throw err;
    }
  }

  private async forwardEventToAlertWebhook(event: string, data: any): Promise<void> {
    const alertUrl = this.alertWebhookUrl;
    if (!alertUrl) return;

    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const secret = this.alertWebhookSecret;
      if (secret) {
        const signature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-Bucare-Signature'] = signature;
      }

      console.log(`[WhatsAppService] Enviando alerta webhook de evento "${event}" a ${alertUrl}`);
      const response = await fetch(alertUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`[WhatsAppService] El webhook de alertas retornó estado ${response.status}`);
      }
    } catch (err) {
      console.error('[WhatsAppService] Error enviando alerta webhook:', err);
    }
  }
}

export const whatsappService = new WhatsAppService();
