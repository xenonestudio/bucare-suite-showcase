import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError.js';
import { env } from '../../config/env.config.js';
import { IUsersRepository } from '../users/users.repository.js';
import { LoginInput } from './auth.schema.js';
import { IUserPublic } from '../users/users.types.js';

interface LoginResponse {
  user: IUserPublic;
  token: string;
}

export class AuthService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  /**
   * Valida credenciales y genera un JWT.
   */
  public async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.usersRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('El usuario está inactivo', 403, 'USER_INACTIVE');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '24h' } // TODO: parametrizar en variables de entorno si se desea
    );

    const { passwordHash: _, ...userPublic } = user;

    return {
      user: userPublic as IUserPublic,
      token,
    };
  }
}
