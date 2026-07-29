import { PrismaClient } from '@prisma/client';
import { logger } from './logger.config.js';

export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

class PrismaDatabaseClient implements IDatabaseClient {
  public client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  public async connect(): Promise<void> {
    await this.client.$connect();
    logger.info('⚡ Conexión a Base de Datos (SQLite vía Prisma) establecida correctamente.');
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
    logger.info('⚡ Conexión a Base de Datos finalizada.');
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Fallo en el healthcheck de la base de datos:', error);
      return false;
    }
  }
}

export const dbClient = new PrismaDatabaseClient();
// Exportamos también la instancia directa de Prisma para usarla en los repositorios
export const prisma = dbClient.client;
