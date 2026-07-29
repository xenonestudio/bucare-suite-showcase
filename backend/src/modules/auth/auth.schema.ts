import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('El correo electrónico no tiene un formato válido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
