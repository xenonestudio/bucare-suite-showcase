import { z } from 'zod';

const userRolesEnum = z.enum([
  'SUPERADMIN',
  'ADMIN',
  'CONTADOR',
  'VENTAS',
  'PROYECTO',
  'CLIENTE',
]);

const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

/**
 * Esquema de validación para registro de nuevo usuario.
 */
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('El correo electrónico no tiene un formato válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    fullName: z.string().min(2, 'El nombre real debe contener al menos 2 caracteres'),
    birthDate: z
      .string()
      .regex(birthDateRegex, 'La fecha de nacimiento debe estar en formato YYYY-MM-DD'),
    phoneNumber: z
      .string()
      .regex(phoneRegex, 'El número de teléfono proporcionado no es válido'),
    role: userRolesEnum.optional().default('CLIENTE'),
  }),
});

/**
 * Esquema de validación para actualización de usuario.
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID de usuario es obligatorio'),
  }),
  body: z.object({
    fullName: z.string().min(2, 'El nombre debe contener al menos 2 caracteres').optional(),
    birthDate: z.string().regex(birthDateRegex, 'La fecha debe estar en formato YYYY-MM-DD').optional(),
    phoneNumber: z.string().regex(phoneRegex, 'El número de teléfono no es válido').optional(),
    role: userRolesEnum.optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Esquema para consulta de usuario por ID.
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID de usuario es obligatorio'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
