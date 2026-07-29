import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from './user.service.js';
import { ValidationError } from '../../shared/errors/errors.js';

// Esquemas de validación estrictos con Zod
const createUserSchema = z.object({
  email: z.string().email('El formato del correo es inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

export class UserController {
  constructor(private readonly userService: UserService) {}

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = createUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new ValidationError('Errores de validación en la petición', parseResult.error.errors);
      }

      const { email, password } = parseResult.data;
      const user = await this.userService.createUser(email, password);

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };
}
