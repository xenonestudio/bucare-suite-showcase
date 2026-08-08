import { PrismaClient } from '@prisma/client';

// Singleton pattern: reutiliza la misma instancia del cliente Prisma
// para evitar que se creen múltiples pools de conexiones.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
