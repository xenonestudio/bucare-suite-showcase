import { EventEmitter } from 'events';
import { logger } from '../config/logger.config.js';

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Prevenir advertencias de pérdida de memoria por exceso de listeners (default es 10)
    this.setMaxListeners(50);
  }

  /**
   * Emite un evento de manera segura registrando cualquier fallo en los listeners.
   */
  public emitEvent(eventName: string, payload?: any): void {
    logger.debug({ payload }, `[EventBus] Emitiendo evento: ${eventName}`);
    
    // El EventEmitter nativo es síncrono.
    // Usamos setImmediate para desacoplarlo del hilo de ejecución principal y forzar asincronía.
    setImmediate(() => {
      try {
        this.emit(eventName, payload);
      } catch (error) {
        logger.error(error, `[EventBus] Error no controlado al procesar evento ${eventName}`);
      }
    });
  }
}

// Instancia singleton para uso en toda la aplicación
export const eventBus = new AppEventBus();

// --- DEFINICIÓN DE EVENTOS DISPONIBLES ---
export const EVENT_TYPES = {
  USER_REGISTERED: 'USER_REGISTERED',
  ORDER_CREATED: 'ORDER_CREATED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
} as const;
