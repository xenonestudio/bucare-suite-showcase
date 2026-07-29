import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { env } from '../../config/env.config.js';

/**
 * Middleware global para la captura y centralización de errores de Express.
 * Sanitiza las respuestas de producción ocultando detalles sensibles.
 */
export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isOperational = err instanceof AppError && err.isOperational;
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  // Attempt to cast to an object that might have 'details' like ValidationError
  const details = (err as any).details || [];

  console.error(`[Error Logged] ${err.name}: ${err.message}`, {
    stack: err.stack,
    isOperational,
    details,
  });

  const responsePayload = {
    success: false,
    error: {
      code: errorCode,
      message: isOperational || env.NODE_ENV !== 'production'
        ? err.message
        : 'Ha ocurrido un error interno en el servidor.',
      details,
    },
    timestamp: new Date().toISOString(),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(responsePayload);
};
