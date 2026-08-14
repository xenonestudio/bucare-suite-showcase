// Cliente API (Native-First) para consumo del Backend Antigravity

export const getApiUrl = (endpoint: string = ''): string => {
  let baseUrl = '';

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('bucaresuite.com')) {
      const protocol = window.location.protocol;
      baseUrl = `${protocol}//api.bucaresuite.com/api/v1`;
    }
  }

  if (!baseUrl) {
    baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  }

  baseUrl = baseUrl.replace(/\/$/, '');

  if (!endpoint) return baseUrl;

  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (path.startsWith('/api/v1')) {
    path = path.substring(7);
  }

  return `${baseUrl}${path}`;
};

export const getResourceUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/uploads')) {
    const apiBase = getApiUrl();
    const base = apiBase.replace(/\/api\/v1$/, '');
    return `${base}${path}`;
  }
  return path;
};

export const API_URL = getApiUrl();

const KEY = "#198923AC782lsroosevelt##";

function encryptLog(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
  }
  return typeof window !== 'undefined' ? window.btoa(result) : result;
}

let isRedirectingToOffline = false;

function handleOffline(endpoint: string, method: string, message: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/offline') return;
  if (isRedirectingToOffline) return;

  isRedirectingToOffline = true;

  try {
    const rawLogs = localStorage.getItem("backend_offline_logs");
    let logs: any[] = [];
    if (rawLogs) {
      let decrypted = "";
      try {
        let raw = window.atob(rawLogs);
        for (let i = 0; i < raw.length; i++) {
          decrypted += String.fromCharCode(raw.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
        }
        logs = JSON.parse(decrypted);
        if (!Array.isArray(logs)) logs = [];
      } catch (e) {
        logs = [];
      }
    }

    logs.push({
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      message,
    });

    if (logs.length > 20) logs.shift();

    const encrypted = encryptLog(JSON.stringify(logs));
    localStorage.setItem("backend_offline_logs", encrypted);
  } catch (e) {
    console.error("Failed to write offline log:", e);
  }

  const fromPath = window.location.pathname + window.location.search + window.location.hash;
  window.location.href = `/offline?from=${encodeURIComponent(fromPath)}`;
}

let isHandlingAuth = false;

function handleAuthExpired(reason: string) {
  if (typeof window === 'undefined') return;
  if (isHandlingAuth) return;
  if (window.location.pathname === '/login') return;

  isHandlingAuth = true;

  // Limpiar sesión
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Notificar al usuario (compatible con Sonner si está montado, o fallback a flag)
  try {
    localStorage.setItem('auth_expired_reason', reason);
  } catch (_) {}

  window.location.href = '/login?expired=1';
}

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    try {
      const response = await originalFetch(input, init);
      const urlStr = typeof input === 'string' ? input : (input as any).url || '';
      const isApiCall = urlStr.includes('/api/v1') || urlStr.includes(':5000') || urlStr.includes('api.bucaresuite.com');

      if (isApiCall) {
        if (response.status === 401) {
          // Token expirado o no autorizado — redirigir a login
          handleAuthExpired('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        } else if (!response.ok && response.status >= 500) {
          handleOffline(urlStr, init?.method || 'GET', `HTTP ${response.status}: Server Error`);
        }
      }
      return response;
    } catch (err: any) {
      const urlStr = typeof input === 'string' ? input : (input as any).url || '';
      const isApiCall = urlStr.includes('/api/v1') || urlStr.includes(':5000') || urlStr.includes('api.bucaresuite.com');

      if (isApiCall) {
        handleOffline(urlStr, init?.method || 'GET', err.message || 'Fetch connection error (Offline)');
      }
      throw err;
    }
  };
}


interface RequestOptions extends RequestInit {
  data?: any;
}

export const api = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = getApiUrl(endpoint);
    const method = options.method || 'GET';
    
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.data instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Agregar Token (si existiera autenticación configurada)
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (options.data && !(options.data instanceof FormData)) {
      config.body = JSON.stringify(options.data);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || errorData.message || `Error ${response.status} en la petición`;
        
        if (response.status >= 500) {
          handleOffline(endpoint, method, `HTTP ${response.status}: ${errorMsg}`);
        }
        
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (err: any) {
      if (!err.message.startsWith('HTTP ')) {
        handleOffline(endpoint, method, err.message || 'Fetch failed (Server unreachable)');
      }
      throw err;
    }
  },

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data: any, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  },

  put<T>(endpoint: string, data: any, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  },

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
};
