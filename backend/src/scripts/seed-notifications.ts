import { prisma } from '../config/database.config.js';

async function seed() {
  console.log('[Seed] Inicializando configuraciones de notificaciones por defecto...');

  const defaults = [
    { event: 'client.created', enabled: true, roles: 'SUPERADMIN,ADMIN,VENTAS' },
    { event: 'chat.message', enabled: true, roles: 'SUPERADMIN,ADMIN,VENTAS' },
    { event: 'cita.created', enabled: true, roles: 'SUPERADMIN,ADMIN,VENTAS' },
    { event: 'cita.reminder.24h', enabled: true, roles: 'SUPERADMIN,ADMIN,VENTAS' },
    { event: 'cita.time', enabled: true, roles: 'SUPERADMIN,ADMIN,VENTAS' },
  ];

  for (const item of defaults) {
    await prisma.notificationSetting.upsert({
      where: { event: item.event },
      update: {},
      create: item,
    });
    console.log(`- Evento "${item.event}" configurado.`);
  }

  console.log('[Seed] Finalizado.');
}

seed()
  .catch(err => console.error('[Seed Error]:', err))
  .finally(() => process.exit(0));
