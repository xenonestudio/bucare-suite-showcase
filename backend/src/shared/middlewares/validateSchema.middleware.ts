import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

/**
 * Middleware genérico para sanitizar y convalidar peticiones HTTP con Zod.
 *
 * @param schema - Esquema de Zod que valida body, query o params.
 */
export const validateSchema =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new AppError(`Error de validación: ${formattedErrors}`, 400, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  };
