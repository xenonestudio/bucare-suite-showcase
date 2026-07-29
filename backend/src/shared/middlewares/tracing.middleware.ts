import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware para asignar un Correlation ID único a cada request.
 * Esto permite rastrear el ciclo de vida completo de la petición a través de los logs.
 */
export const tracingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generar UUID nativo de Node.js
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  
  // Asignar el ID a la request para que esté disponible en controladores
  req.id = requestId as string;
  
  // Incluir el ID en la respuesta para visibilidad del cliente
  res.setHeader('X-Request-ID', requestId);

  next();
};

// Extender la interfaz Request de Express para que acepte `id`
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
