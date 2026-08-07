import { create, Client } from '@open-wa/wa-automate';
import * as path from 'path';
import { prisma } from '../config/database.config.js';
import { generateGeminiResponse } from '../services/gemini.service.js';

// Port for Chrome DevTools Protocol - allows attaching to the running browser
const CDP_PORT = 9222;

class WhatsAppService {
  private client: Client | null = null;
  private qrCodeBase64: string | null = null;
  private isConnected: boolean = false;
  private isInitializing: boolean = false;
  private connectedPhone: string | null = null;
  private qrPollerTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Attaches to the Chrome browser already launched by wa-automate via CDP
   * and captures a screenshot of the QR code element.
   * This works because wa-automate is configured to expose the CDP port 9222.
   */
  private startQrPoller(): void {
    if (this.qrPollerTimer) return;
    console.log('[WhatsAppService] Iniciando poller de QR via CDP...');
    const puppeteer = require('puppeteer');

    this.qrPollerTimer = setInterval(async () => {
      if (this.isConnected) { this.stopQrPoller(); return; }
      try {
        // Connect to the already-running Chrome (launched by wa-automate)
        const browser = await puppeteer.connect({
          browserURL: `http://localhost:${CDP_PORT}`,
          defaultViewport: null,
        });

        try {
          const pages = await browser.pages();
          const waPage = pages.find((p: any) => p.url().includes('web.whatsapp.com')) || pages[0];
          if (!waPage) { await browser.disconnect(); return; }

          await new Promise<void>(r => setTimeout(r, 2000));

          const qrEl = await waPage.$('div[data-ref]');
          if (qrEl) {
            const buf: Buffer = await qrEl.screenshot({ type: 'png' });
            const b64 = `data:image/png;base64,${buf.toString('base64')}`;
            if (this.qrCodeBase64 !== b64) {
              this.qrCodeBase64 = b64;
              this.isInitializing = false;
              console.log('[WhatsAppService] QR capturado via CDP poller');
            }
          } else {
            // No QR = either authenticated or still loading
            const isAuthed: boolean = await waPage.evaluate(() => {
              const app = document.getElementById('app') || document.querySelector('[data-testid="chat"]');
              return !!app;
            });
            if (isAuthed) {
              console.log('[WhatsAppService] Sesion autenticada detectada via CDP poller');
              this.isConnected = true; this.qrCodeBase64 = null; this.stopQrPoller();
            }
          }
        } finally {
          await browser.disconnect(); // disconnect, NOT close - don't kill wa-automate's browser
        }
      } catch (err: any) {
        const msg = (err?.message || '').substring(0, 100);
        console.log('[WhatsAppService] CDP Poller (ignorado):', msg);
      }
    }, 8000);
  }

  private stopQrPoller(): void {
    if (this.qrPollerTimer) {
      clearInterval(this.qrPollerTimer);
      this.qrPollerTimer = null;
      console.log('[WhatsAppService] Poller de QR detenido.');
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitializing || this.isConnected) return;
    this.isInitializing = true;
    console.log('[WhatsAppService] Inicializando WA-Automate...');

    // Give wa-automate ~20 seconds to open Chrome before we start polling
    setTimeout(() => this.startQrPoller(), 20000);

    try {
      this.client = await create({
        sessionId: 'BUCARE_WA_BOT',
        multiDevice: true,
        authTimeout: 60,
        blockCrashLogs: true,
        disableSpins: true,
        headless: true,
        useChrome: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        logConsole: false,
        popup: false,
        qrTimeout: 0,
        hostNotificationLang: 'es-ES',
        // Expose Chrome DevTools Protocol port so our poller can attach
        chromiumArgs: [`--remote-debugging-port=${CDP_PORT}`],
        catchQR: (qrCode: string) => {
          console.log('[WhatsAppService] catchQR callback disparado');
          this.qrCodeBase64 = qrCode;
          this.isConnected = false; this.isInitializing = false;
          this.stopQrPoller();
        },
      } as any);

      this.stopQrPoller();
      this.isConnected = true; this.qrCodeBase64 = null; this.isInitializing = false;

      try {
        const hostInfo: any = await this.client.getMe();
        this.connectedPhone = hostInfo?.me?.user || hostInfo?.id || 'Conectado';
      } catch { this.connectedPhone = 'WhatsApp Activo'; }

      console.log(`[WhatsAppService] WhatsApp conectado (${this.connectedPhone})`);
      this.setupListeners();
    } catch (error) {
      console.error('[WhatsAppService] Error al inicializar:', error);
      this.stopQrPoller();
      this.isConnected = false; this.isInitializing = false;
    }
  }

  private setupListeners(): void {
    if (!this.client) return;
    this.client.onMessage(async (message: any) => {
      try {
        if (message.isGroupMsg || message.from === 'status@broadcast') return;
        const rawFrom = message.from || '';
        const senderPhone = rawFrom.replace('@c.us', '').replace(/[^0-9]/g, '');
        const messageText = message.body;
        const senderName = message.sender?.pushname || message.sender?.name || `Cliente WA (+${senderPhone})`;
        console.log(`[WhatsAppService] Mensaje de +${senderPhone}: "${messageText}"`);
        const user = await prisma.user.findFirst({ where: { phoneNumber: { contains: senderPhone } } });
        let session = await prisma.chatSession.findFirst({
          where: { OR: [{ guestToken: `wa_${senderPhone}` }, ...(user ? [{ userId: user.id }] : [])] },
          include: { messages: { orderBy: { createdAt: 'desc' }, take: 10 } },
        });
        if (!session) {
          session = await prisma.chatSession.create({
            data: { guestToken: `wa_${senderPhone}`, guestName: senderName, project: 'BUCARE_SUITE', isAiActive: true, ...(user ? { userId: user.id } : {}) },
            include: { messages: { orderBy: { createdAt: 'desc' }, take: 10 } },
          });
        }
        await prisma.chatMessage.create({ data: { sessionId: session.id, sender: 'USER', content: messageText } });
        if (session.isAiActive) {
          const history = (session.messages || []).reverse().map(m => ({ sender: m.sender as 'USER' | 'AI' | 'ADMIN', content: m.content }));
          const aiReply = await generateGeminiResponse({
            userId: user?.id, userFullName: user?.fullName || undefined, userEmail: user?.email || undefined,
            isAuthenticated: !!user, guestName: senderName, project: session.project as 'BUCARE_SUITE' | 'BUCARE_PLAZA',
            history, userMessage: messageText,
          });
          await prisma.chatMessage.create({ data: { sessionId: session.id, sender: 'AI', content: aiReply } });
          if (this.client) await this.client.sendText(message.from as any, aiReply);
        }
      } catch (err) { console.error('[WhatsAppService] Error procesando mensaje:', err); }
    });
    this.client.onStateChanged((state: string) => {
      console.log(`[WhatsAppService] Estado: ${state}`);
      if (state === 'UNPAIRED' || state === 'UNLAUNCHED') this.isConnected = false;
    });
  }

  public async sendTextMessage(phone: string, text: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.warn('[WhatsAppService] No conectado, mensaje no enviado.'); return false;
    }
    try {
      let cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone.endsWith('@c.us')) cleanPhone = `${cleanPhone}@c.us`;
      await this.client.sendText(cleanPhone as any, text);
      console.log(`[WhatsAppService] Mensaje enviado a ${cleanPhone}`);
      return true;
    } catch (err) {
      console.error(`[WhatsAppService] Error enviando a ${phone}:`, err); return false;
    }
  }

  public async sendAppointmentNotification(phone: string, citaDetails: { fecha: string; tipoPropiedad: string; notas?: string }): Promise<boolean> {
    if (!phone) return false;
    const formattedProp = citaDetails.tipoPropiedad === 'LOCAL' ? 'Bucare Plaza (Local Comercial)' : 'Bucare Suite (Apartamento de Lujo)';
    const msg = `Confirmacion de Cita - Bucare Suite & Plaza\n\nHola! Tu cita para ${formattedProp} ha sido agendada.\n\nFecha y Hora: ${citaDetails.fecha}\nNotas: ${citaDetails.notas || 'Visita guiada comercial'}\n\nUbicacion: QQJC+93C, Av. Principal, San Cristobal, Nueva Guayana.\n\nSi requieres modificar o cancelar, responde este mensaje.`;
    return this.sendTextMessage(phone, msg);
  }

  public getStatus() {
    return { connected: this.isConnected, initializing: this.isInitializing, phone: this.connectedPhone, qrCode: this.qrCodeBase64 };
  }

  public async restart(): Promise<void> {
    this.stopQrPoller();
    try { if (this.client) await this.client.kill(); } catch { /* ignore */ }
    this.client = null;
    this.isConnected = false; this.isInitializing = false; this.qrCodeBase64 = null;
    await this.initialize();
  }
}

export const whatsappService = new WhatsAppService();
