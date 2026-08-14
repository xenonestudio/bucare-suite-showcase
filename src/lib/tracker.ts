import { getApiUrl } from './api';

// Generar UUID aleatorio
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Obtener o inicializar un fingerprint único persistido
export function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  let fp = localStorage.getItem('visitor_fingerprint');
  if (!fp) {
    // Intentar leer de cookie
    const match = document.cookie.match(/(^| )visitor_fingerprint=([^;]+)/);
    if (match) {
      fp = match[2];
      localStorage.setItem('visitor_fingerprint', fp);
    } else {
      fp = 'fp_' + generateUUID().replace(/-/g, '');
      localStorage.setItem('visitor_fingerprint', fp);
      
      // Guardar cookie por 1 año
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      document.cookie = `visitor_fingerprint=${fp}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
    }
  }
  return fp;
}

// Analizar User-Agent simple para Navegador y OS
function getBrowserAndOS() {
  if (typeof window === 'undefined') return { browser: 'Unknown', os: 'Unknown' };
  
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  // OS
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('X11') !== -1) os = 'UNIX';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

  // Browser
  if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('MSIE') !== -1 || !!(document as any).documentMode) browser = 'IE';
  else if (ua.indexOf('Edge') !== -1) browser = 'Edge';

  return { browser, os };
}

// Detectar si está instalado como PWA Standalone
export function isPwa(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

// Detectar permisos de notificaciones push en este navegador
export function isPushPermissionGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

// Variable para controlar temporizador global del heartbeat
let heartbeatTimer: any = null;
let lastPath = '';
let pageStartedAt = Date.now();

// Enviar tracking al backend
async function sendTracking(path: string, title: string, isHeartbeat: boolean) {
  if (typeof window === 'undefined') return;

  const fingerprint = getOrCreateFingerprint();
  const isPwaInstalled = isPwa();
  const pushEnabled = isPushPermissionGranted();
  const { browser, os } = getBrowserAndOS();
  
  // Buscar userId del localStorage si existe sesión activa
  let userId: string | null = null;
  try {
    const sessionData = localStorage.getItem('bucare_auth_session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed?.user?.id) {
        userId = parsed.user.id;
      }
    }
  } catch (_) {}

  const durationMs = Date.now() - pageStartedAt;

  try {
    await fetch(getApiUrl('/analytics/track'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint,
        path,
        title,
        isPwaInstalled,
        pushEnabled,
        userId,
        browser,
        os,
        isHeartbeat,
        durationMs
      })
    });
  } catch (err) {
    // Falla silenciosa para no interrumpir la experiencia de usuario
    console.debug('[Tracker Log] Error enviando tracking:', err);
  }
}

// Inicializar el tracker de navegación
export function initTracker() {
  if (typeof window === 'undefined') return;

  // Evitar inicializaciones múltiples
  if (heartbeatTimer) return;

  // Registrar primera carga
  lastPath = window.location.pathname;
  pageStartedAt = Date.now();
  sendTracking(lastPath, document.title, false);

  // Monitorear cambios de ruta y URL utilizando MutationObserver y eventos de popstate
  let currentUrl = window.location.href;
  const bodyElement = document.querySelector('body');
  
  if (bodyElement) {
    const observer = new MutationObserver(() => {
      if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        
        // Reportar pageview de salida/cambio
        const path = window.location.pathname;
        if (path !== lastPath) {
          sendTracking(lastPath, document.title, false); // Guarda duración de la anterior
          lastPath = path;
          pageStartedAt = Date.now();
          sendTracking(path, document.title, false); // Nueva página
        }
      }
    });
    observer.observe(bodyElement, { subtree: true, childList: true });
  }

  // Latido periódico para actualizar duración e indicar visitas en vivo (cada 15 segs)
  heartbeatTimer = setInterval(() => {
    sendTracking(window.location.pathname, document.title, true);
  }, 15000);
}

// Asociar el visitante anónimo actual con un usuario registrado (post-login/post-registro)
export async function associateVisitorWithUser(userId: string) {
  if (typeof window === 'undefined') return;
  const fingerprint = getOrCreateFingerprint();
  try {
    await fetch(getApiUrl('/analytics/associate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint, userId })
    });
  } catch (err) {
    console.error('[Tracker] Error en asociación:', err);
  }
}
