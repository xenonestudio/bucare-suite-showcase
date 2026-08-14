import app from './app.js';
import { env } from './config/env.config.js';
import { dbClient, prisma } from './config/database.config.js';
import bcrypt from 'bcryptjs';
import { startCitasReminderCron } from './services/citas-reminder.service.js';

// Conectar Base de Datos y realizar seeding en segundo plano sin bloquear Passenger
async function initDb() {
  try {
    await dbClient.connect();
    console.log('✅ Adaptador de Base de Datos conectado correctamente.');

    // Iniciar programador de notificaciones de citas
    startCitasReminderCron();

    const superAdminEmail = 'xenonestudio@gmail.com';

    const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } }).catch(() => null);
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
      }).catch((e) => console.error('Error sembrando Superadmin:', e));
      console.log('✅ Usuario Superadmin verificado.');
    }
  } catch (error) {
    console.error('⚠️ Advertencia: Error inicializando la BD en segundo plano:', error);
  }
}

initDb();

// Si se ejecuta de forma independiente (fuera de Phusion Passenger), iniciar escucha en puerto
if (!process.env.PHUSION_PASSENGER && !process.env.PASSENGER_APP_ENV) {
  const portToListen = env.PORT || 5000;
  app.listen(portToListen, () => {
    console.log(`🚀 Servidor Backend iniciado localmente en puerto: ${portToListen}`);
  });
}

// Exportar Express app para que Phusion Passenger en cPanel la gestione de forma nativa sin colisión de socket
export default app;
module.exports = app;
