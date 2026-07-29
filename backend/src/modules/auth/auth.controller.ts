import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { CreateUserInput } from '../users/users.schema.js';
import { LoginInput } from './auth.schema.js';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  public login = async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await this.authService.login(req.body);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  public register = async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Force role to CLIENTE for self-registration via Auth
      const input = {
        ...req.body,
        role: 'CLIENTE' as const,
      };

      const user = await this.usersService.registerUser(input);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
