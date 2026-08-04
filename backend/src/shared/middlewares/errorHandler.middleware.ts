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
  const isOperational = (err as any).isOperational === true;
  const statusCode = typeof (err as any).statusCode === 'number' ? (err as any).statusCode : 500;
  const errorCode = typeof (err as any).errorCode === 'string' ? (err as any).errorCode : 'INTERNAL_SERVER_ERROR';
  // Attempt to cast to an object that might have 'details' like ValidationError
  const details = (err as any).details || [];

  console.error(`[Error Logged] ${err.name || 'Error'}: ${err.message}`, {
    stack: err.stack,
    isOperational,
    details,
  });

  const responsePayload = {
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'Ha ocurrido un error interno en el servidor.',
      details,
    },
    timestamp: new Date().toISOString(),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(responsePayload);
};
