import app from './app.js';
import { env } from './config/env.config.js';
import { dbClient, prisma } from './config/database.config.js';
import bcrypt from 'bcryptjs';

/**
 * Inicia el servidor backend HTTP y realiza comprobaciones previas.
 */
async function startServer(): Promise<void> {
  try {
    // 1. Conectar adaptador de Base de Datos
    await dbClient.connect();

    // 1.5. Seed Superadmin si no existe
    const superAdminEmail = 'xenonestudio@gmail.com';
    const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });
    if (!existingSuperAdmin) {
      console.log('🌱 Sembrando usuario Superadmin inicial...');
      const passwordHash = await bcrypt.hash('2887245.Alex', 10);
      await prisma.user.create({
        data: {
          email: superAdminEmail,
          passwordHash,
          fullName: 'Super Admin',
          role: 'SUPERADMIN',
          isActive: true,
        },
      });
      console.log('✅ Usuario Superadmin creado exitosamente.');
    }

    // 2. Iniciar escucha HTTP
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Servidor Backend iniciado con éxito en el puerto ${env.PORT}`);
      console.log(`🌍 Entorno: ${env.NODE_ENV}`);
      console.log(`🔗 Healthcheck: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Manejo de cierres limpios (Graceful Shutdown)
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️ Señal ${signal} recibida. Cerrando servidor de forma limpia...`);
      server.close(async () => {
        await dbClient.disconnect();
        console.log('✅ Servidor y conexiones cerradas correctamente.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Error crítico durante el inicio del servidor:', error);
    process.exit(1);
  }
}

// Captura de errores no controlados a nivel de proceso
process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 Unhandled Rejection detectado:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception detectado:', error);
  process.exit(1);
});

startServer();
