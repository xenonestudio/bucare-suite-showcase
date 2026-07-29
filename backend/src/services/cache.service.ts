/**
 * Implementación de un Caché en memoria nativo (In-Memory Map) con soporte de TTL (Time-to-Live).
 * Cumple con la regla de cero dependencias externas (Sin Redis/Memcached).
 * Ideal para configuraciones globales, catálogos pequeños, tokens temporales o rate-limiters simples.
 */
class CacheService {
  private cache: Map<string, { value: any; expiry: number }>;

  constructor() {
    this.cache = new Map();
    // Iniciar limpieza periódica cada minuto para evitar memory leaks de claves no leídas
    setInterval(() => this.cleanup(), 60000).unref();
  }

  /**
   * Almacena un valor en la caché.
   * @param key Identificador único de la llave.
   * @param value Información a almacenar.
   * @param ttlInSeconds Tiempo de vida en segundos (por defecto 300s = 5 minutos).
   */
  public set(key: string, value: any, ttlInSeconds = 300): void {
    const expiry = Date.now() + ttlInSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Obtiene un valor de la caché.
   * Si el TTL ha expirado, lo elimina y devuelve nulo.
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Elimina una clave de forma manual.
   */
  public del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vacía toda la caché.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Limpia los elementos expirados para liberar memoria.
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia Singleton global
export const inMemoryCache = new CacheService();
