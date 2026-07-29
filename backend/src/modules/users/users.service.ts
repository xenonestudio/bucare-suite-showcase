import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/AppError.js';
import { IUsersRepository } from './users.repository.js';
import { CreateUserInput, UpdateUserInput } from './users.schema.js';
import { IUserPublic, UserRole } from './users.types.js';

export class UsersService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  /**
   * Registra un nuevo usuario en la plataforma con validación de datos extendidos.
   *
   * @param input - Datos sanitizados de creación del usuario.
   * @returns Datos públicos del usuario creado.
   * @throws {AppError} 409 si el correo electrónico ya existe.
   */
  public async registerUser(input: CreateUserInput): Promise<IUserPublic> {
    const existingUser = await this.usersRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError('El correo electrónico ya se encuentra registrado', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.usersRepository.create({
      ...input,
      passwordHash,
    });

    const { passwordHash: _, ...userPublic } = user;
    return userPublic;
  }

  /**
   * Obtiene un usuario por su ID único.
   *
   * @param id - Identificador del usuario.
   * @returns Perfil público del usuario.
   * @throws {AppError} 404 si el usuario no existe.
   */
  public async getUserById(id: string): Promise<IUserPublic> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const { passwordHash: _, ...userPublic } = user;
    return userPublic;
  }

  /**
   * Obtiene la lista de usuarios pertenecientes a un rol específico.
   *
   * @param role - Rol a filtrar.
   * @returns Lista de usuarios filtrados.
   */
  public async getUsersByRole(role: UserRole): Promise<IUserPublic[]> {
    const users = await this.usersRepository.findByRole(role);
    return users.map(({ passwordHash: _, ...publicUser }) => publicUser);
  }

  /**
   * Actualiza el perfil de un usuario existente.
   *
   * @param id - ID del usuario a modificar.
   * @param input - Campos a actualizar.
   * @returns Perfil actualizado.
   * @throws {AppError} 404 si el usuario no existe.
   */
  public async updateUser(id: string, input: UpdateUserInput): Promise<IUserPublic> {
    const updated = await this.usersRepository.update(id, input);

    if (!updated) {
      throw new AppError('Usuario no encontrado para actualizar', 404, 'USER_NOT_FOUND');
    }

    const { passwordHash: _, ...userPublic } = updated;
    return userPublic;
  }

  /**
   * Obtiene el listado completo de usuarios.
   *
   * @returns Colección de perfiles de usuario.
   */
  public async getAllUsers(): Promise<IUserPublic[]> {
    const users = await this.usersRepository.findAll();
    return users.map(({ passwordHash: _, ...publicUser }) => publicUser);
  }
}
