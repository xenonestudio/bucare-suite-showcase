import pino from 'pino';
import { env } from './env.config.js';

const isProduction = env.NODE_ENV === 'production';

/**
 * Instancia global de Pino Logger.
 * En producción se utiliza el formato JSON estricto para monitoreo.
 * En desarrollo se utiliza pino-pretty para fácil lectura en consola.
 */
export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
