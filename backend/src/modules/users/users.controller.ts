import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { UserRole } from './users.types.js';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registra un nuevo usuario con campos extendidos.
   */
  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser = await this.usersService.registerUser(req.body);
      res.status(201).json({
        success: true,
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene un usuario por ID.
   */
  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await this.usersService.getUserById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza el perfil de un usuario.
   */
  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updatedUser = await this.usersService.updateUser(id, req.body);
      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista usuarios filtrando opcionalmente por rol.
   */
  public getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleQuery = req.query.role as UserRole | undefined;
      const users = roleQuery
        ? await this.usersService.getUsersByRole(roleQuery)
        : await this.usersService.getAllUsers();

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };
}
