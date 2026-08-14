import bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository.js';
import { ConflictError, NotFoundError } from '../../shared/errors/errors.js';
import { eventBus } from '../../events/eventBus.js';
import { inMemoryCache as cacheService } from '../../services/cache.service.js';
import { User } from '../../generated/client/index.js';
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(email: string, passwordPlain: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const user = await this.userRepository.create({
      email,
      passwordHash,
    });

    // Emisión de evento (Asíncrono, no bloquea el hilo)
    eventBus.emit('user.created', { userId: user.id, email: user.email });

    // Invalidar caché si existiera alguna lista de usuarios cacheados
    cacheService.del('users_list');

    return user;
  }

  async getUserById(id: string) {
    const cacheKey = `user_${id}`;
    
    // Intento de obtener de caché
    const cachedUser = cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Guardar en caché (TTL 5 minutos)
    cacheService.set(cacheKey, user, 300);

    return user;
  }
}
