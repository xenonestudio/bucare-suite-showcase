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

interface GoogleTokenPayload {
  email?: string;
  sub?: string;
  aud?: string;
  name?: string;
  given_name?: string;
  picture?: string;
}

export class AuthService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  /**
   * Valida credenciales y genera un JWT.
   */
  public async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.usersRepository.findByEmail(input.email);

    if (!user || !user.passwordHash) {
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

  /**
   * Autentica o registra un usuario mediante un token ID de Google.
   */
  public async googleLogin(idToken: string): Promise<LoginResponse> {
    // Verificar token directamente con la API pública de Google Tokeninfo
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!googleResponse.ok) {
      throw new AppError('Token de Google inválido o expirado', 401, 'INVALID_GOOGLE_TOKEN');
    }

    const payload = (await googleResponse.json()) as GoogleTokenPayload;

    if (!payload.email || !payload.sub) {
      throw new AppError('El token de Google no contiene información válida de usuario', 400, 'INVALID_GOOGLE_PAYLOAD');
    }

    // Verificar aud si GOOGLE_CLIENT_ID está configurado
    if (env.GOOGLE_CLIENT_ID && payload.aud !== env.GOOGLE_CLIENT_ID) {
      throw new AppError('El token de Google no corresponde a esta aplicación', 401, 'UNAUTHORIZED_GOOGLE_CLIENT');
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const fullName = payload.name || payload.given_name || email.split('@')[0];
    const avatarUrl = payload.picture;

    // 1. Buscar usuario por googleId
    let user = await this.usersRepository.findByGoogleId(googleId);

    // 2. Si no existe por googleId, buscar por email
    if (!user) {
      user = await this.usersRepository.findByEmail(email);

      if (user) {
        // Enlazar cuenta existente con Google
        user = await this.usersRepository.linkGoogleId(user.id, googleId, avatarUrl);
      } else {
        // Crear nuevo usuario registrado con Google
        user = await this.usersRepository.createGoogleUser({
          email,
          fullName,
          googleId,
          avatarUrl,
        });
      }
    }

    if (!user.isActive) {
      throw new AppError('El usuario está inactivo', 403, 'USER_INACTIVE');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userPublic } = user;

    return {
      user: userPublic as IUserPublic,
      token,
    };
  }
}
