/**
 * Roles disponibles en la plataforma Bucare Suite.
 */
export type UserRole =
  | 'SUPERADMIN'
  | 'ADMINISTRADOR'
  | 'CONTABILIDAD'
  | 'VENTAS'
  | 'PROYECTO'
  | 'USUARIO';

/**
 * Entidad de dominio que representa un Usuario en el sistema.
 */
export interface IUser {
  id: string;
  email: string;
  fullName: string;
  birthDate: string; // Formato YYYY-MM-DD
  phoneNumber: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos públicos del usuario sin información sensible.
 */
export type IUserPublic = Omit<IUser, 'passwordHash'>;

/**
 * Payload DTO para la creación de un nuevo usuario.
 */
export interface ICreateUserDTO {
  email: string;
  fullName: string;
  birthDate: string;
  phoneNumber: string;
  password: string;
  role?: UserRole;
}

/**
 * Payload DTO para actualización de perfil de usuario.
 */
export interface IUpdateUserDTO {
  fullName?: string;
  birthDate?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
}
