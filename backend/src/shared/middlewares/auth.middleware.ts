import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config.js';
import { AppError } from '../errors/AppError.js';
import { UserRole } from '../../modules/users/users.types.js';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

/**
 * Middleware para verificar la validez del token JWT en peticiones autenticadas.
 */
export const authenticateJWT = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No se proporcionó un token de autenticación válido', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch (_error) {
    return next(new AppError('El token de autenticación es inválido o ha expirado', 401, 'INVALID_TOKEN'));
  }
};

/**
 * Middleware RBAC para validar roles requeridos en endpoints restringidos.
 *
 * @param allowedRoles - Roles autorizados a acceder al recurso.
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Acceso denegado: El rol '${req.user.role}' no tiene permisos para realizar esta acción`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};
