import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Esquema de validación para las variables de entorno de la aplicación.
 * Soporta puertos numéricos y sockets de Phusion Passenger.
 */
const envSchema = z.object({
  PORT: z
    .union([z.string(), z.number()])
    .default('5000')
    .transform((val) => {
      if (typeof val === 'number') return val;
      const str = String(val).trim();
      return /^\d+$/.test(str) ? parseInt(str, 10) : str;
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('production'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z
    .string()
    .default('bucare_suite_default_jwt_secret_key_2026_super_secure_key'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  GOOGLE_CLIENT_ID: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('⚠️ Advertencia: Error parseando variables de entorno, usando valores por defecto:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    return envSchema.parse({});
  }

  return result.data;
};

export const env = parseEnv();
