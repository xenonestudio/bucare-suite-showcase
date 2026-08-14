import { Router } from 'express';
import { prisma } from '../../config/database.config.js';
import { authenticateJWT } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

// Cache simple en memoria para geolocalización de IPs
const geoCache = new Map<string, { country: string; city: string }>();

async function resolveGeo(ip: string, visitorId: string) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')) return;
  if (geoCache.has(ip)) {
    const cached = geoCache.get(ip)!;
    await prisma.visitor.update({ where: { id: visitorId }, data: { country: cached.country, city: cached.city } }).catch(() => null);
    return;
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
    if (res.ok) {
      const data = await res.json() as { status: string; country?: string; city?: string };
      if (data.status === 'success' && data.country) {
        const country = data.country;
        const city = data.city || 'Unknown';
        geoCache.set(ip, { country, city });
        await prisma.visitor.update({ where: { id: visitorId }, data: { country, city } });
      }
    }
  } catch (err) {
    console.error(`[Analytics Geo] Error geolocalizando IP ${ip}:`, err);
  }
}

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) return 'mobile';
  return 'desktop';
}

// ── 1. RASTREO EN VIVO ──
router.post('/track', async (req, res) => {
  try {
    const { fingerprint, path, title, isPwaInstalled, pushEnabled, userId, browser, os, isHeartbeat, durationMs } = req.body;
    if (!fingerprint) return res.status(400).json({ success: false, message: 'Se requiere fingerprint' });

    const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
    const ip = rawIp.split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = getDeviceType(userAgent);

    const visitor = await prisma.visitor.upsert({
      where: { fingerprint },
      create: { fingerprint, ip, deviceType, browser: browser || null, os: os || null, isPwaInstalled: Boolean(isPwaInstalled), pushEnabled: Boolean(pushEnabled), userId: userId || null },
      update: { ip, isPwaInstalled: Boolean(isPwaInstalled), pushEnabled: Boolean(pushEnabled), ...(userId ? { userId } : {}), updatedAt: new Date() }
    });

    if (!visitor.country || visitor.country === 'Unknown') {
      resolveGeo(ip, visitor.id).catch(() => null);
    }

    const threshold = new Date(Date.now() - 30 * 60 * 1000);
    let session = await prisma.visitorSession.findFirst({
      where: { visitorId: visitor.id, lastActiveAt: { gte: threshold }, endedAt: null }
    });

    const now = new Date();
    if (!session) {
      session = await prisma.visitorSession.create({
        data: { visitorId: visitor.id, ipAddress: ip, startedAt: now, lastActiveAt: now, durationSeconds: 0 }
      });
    } else {
      const diffSeconds = Math.round((now.getTime() - session.startedAt.getTime()) / 1000);
      session = await prisma.visitorSession.update({
        where: { id: session.id },
        data: { lastActiveAt: now, durationSeconds: Math.max(session.durationSeconds, diffSeconds) }
      });
    }

    if (!isHeartbeat && path) {
      await prisma.visitorPageview.create({
        data: { sessionId: session.id, path, title: title || path, durationMs: durationMs || 0 }
      });
    }

    return res.status(200).json({ success: true, visitorId: visitor.id, sessionId: session.id });
  } catch (error: any) {
    console.error('[Analytics Track Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── 2. ASOCIAR VISITANTE A USUARIO ──
router.post('/associate', async (req, res) => {
  try {
    const { fingerprint, userId } = req.body;
    if (!fingerprint || !userId) return res.status(400).json({ success: false, message: 'Se requiere fingerprint y userId' });

    const visitor = await prisma.visitor.findUnique({ where: { fingerprint } });
    if (visitor) await prisma.visitor.update({ where: { id: visitor.id }, data: { userId } });

    return res.status(200).json({ success: true, message: 'Asociación de visitante exitosa' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── 3. KPIs PRINCIPALES DE TRÁFICO Y ANALÍTICA ──
router.get('/kpis', authenticateJWT, async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!['SUPERADMIN', 'ADMIN', 'VENTAS', 'CONTADOR'].includes(userRole || '')) {
      return res.status(403).json({ success: false, message: 'Acceso no autorizado' });
    }

    const ahora = new Date();
    const inicioDia     = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioSemana  = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioMes     = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnt  = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnt     = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);

    // En vivo
    const limiteEnVivo = new Date(Date.now() - 3 * 60 * 1000);
    const enVivoCount = await prisma.visitorSession.count({
      where: { lastActiveAt: { gte: limiteEnVivo }, endedAt: null }
    });

    // Visitas por período
    const [visitasDia, visitasSemana, visitasMes, visitasMesAnterior] = await Promise.all([
      prisma.visitorSession.count({ where: { startedAt: { gte: inicioDia } } }),
      prisma.visitorSession.count({ where: { startedAt: { gte: inicioSemana } } }),
      prisma.visitorSession.count({ where: { startedAt: { gte: inicioMes } } }),
      prisma.visitorSession.count({ where: { startedAt: { gte: inicioMesAnt, lte: finMesAnt } } }),
    ]);

    const tendenciaVisitas = visitasMesAnterior > 0
      ? Math.round(((visitasMes - visitasMesAnterior) / visitasMesAnterior) * 100)
      : 0;

    // Duración promedio
    const promDur = await prisma.visitorSession.aggregate({ _avg: { durationSeconds: true } });
    const avgDurationSeconds = Math.round(promDur._avg.durationSeconds || 0);

    // Geografía
    const paisesRaw = await prisma.visitor.groupBy({
      by: ['country'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10
    });
    const paises = paisesRaw.map(p => ({ country: p.country || 'Unknown', count: p._count.id }));

    // Dispositivos
    const dispositivosRaw = await prisma.visitor.groupBy({ by: ['deviceType'], _count: { id: true } });
    const dispositivos = dispositivosRaw.map(d => ({ type: d.deviceType || 'desktop', count: d._count.id }));

    // PWA y Push
    const [totalVisitantes, pwaInstaladas, pushHabilitadas] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { isPwaInstalled: true } }),
      prisma.visitor.count({ where: { pushEnabled: true } }),
    ]);

    // Páginas más visitadas
    const paginasRaw = await prisma.visitorPageview.groupBy({
      by: ['path', 'title'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10
    });
    const paginasMasVisitadas = paginasRaw.map(p => ({ path: p.path, title: p.title || p.path, views: p._count.id }));

    // Visitantes recientes en vivo
    const visitasRecientes = await prisma.visitorSession.findMany({
      orderBy: { lastActiveAt: 'desc' },
      take: 20,
      include: {
        visitor: {
          include: { user: { select: { fullName: true, email: true } } }
        }
      }
    });

    // Retención: nuevos vs recurrentes por semana (8 semanas)
    const retencionSemanas: Array<{ semana: string; nuevos: number; recurrentes: number }> = [];
    for (let i = 7; i >= 0; i--) {
      const ini = new Date(ahora.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const fin = new Date(ahora.getTime() - i       * 7 * 24 * 60 * 60 * 1000);
      const [nuevos, recurrentes] = await Promise.all([
        prisma.visitor.count({ where: { createdAt: { gte: ini, lt: fin } } }),
        prisma.visitorSession.count({
          where: { startedAt: { gte: ini, lt: fin }, visitor: { createdAt: { lt: ini } } }
        }),
      ]);
      retencionSemanas.push({ semana: `S${8 - i}`, nuevos, recurrentes });
    }

    // Tasa de rebote (sesiones del mes con al menos 1 pageview vs sin ninguna)
    const [sesionesTotal, sesionesConVistas] = await Promise.all([
      prisma.visitorSession.count({ where: { startedAt: { gte: inicioMes } } }),
      prisma.visitorSession.count({ where: { startedAt: { gte: inicioMes }, pageviews: { some: {} } } }),
    ]);
    const tasaRebote = sesionesTotal > 0
      ? Math.round(((sesionesTotal - sesionesConVistas) / sesionesTotal) * 100)
      : 0;

    // Embudo de retención (visitantes con 2x, 3x, 4x sesiones)
    const visitantesConSesiones = await prisma.visitor.findMany({
      select: { _count: { select: { sessions: true } } },
      where: { sessions: { some: {} } }
    });
    const retornaron2x = visitantesConSesiones.filter(v => v._count.sessions >= 2).length;
    const retornaron3x = visitantesConSesiones.filter(v => v._count.sessions >= 3).length;
    const retornaron4x = visitantesConSesiones.filter(v => v._count.sessions >= 4).length;

    return res.status(200).json({
      success: true,
      data: {
        enVivoCount, visitasDia, visitasSemana, visitasMes, visitasMesAnterior, tendenciaVisitas,
        avgDurationSeconds, tasaRebote, paises, dispositivos, totalVisitantes, pwaInstaladas,
        pushHabilitadas, paginasMasVisitadas, retencionSemanas,
        embudo: { total: totalVisitantes, retornaron2x, retornaron3x, retornaron4x },
        visitasRecientes: visitasRecientes.map(s => ({
          sessionId: s.id,
          fingerprint: s.visitor.fingerprint.substring(0, 8),
          ip: s.visitor.ip || '—',
          location: `${s.visitor.city || '?'}, ${s.visitor.country || '?'}`,
          device: s.visitor.deviceType,
          os: s.visitor.os || 'Unknown',
          browser: s.visitor.browser || 'Unknown',
          duration: s.durationSeconds,
          isPwa: s.visitor.isPwaInstalled,
          isPush: s.visitor.pushEnabled,
          associatedUser: s.visitor.user ? (s.visitor.user.fullName || s.visitor.user.email) : null,
          lastActive: s.lastActiveAt
        }))
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── 4. KPIs DE CITAS ──
router.get('/kpis/citas', authenticateJWT, async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!['SUPERADMIN', 'ADMIN', 'VENTAS'].includes(userRole || '')) {
      return res.status(403).json({ success: false, message: 'Acceso no autorizado' });
    }

    const ahora     = new Date();
    const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const en24h     = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    const [totalMes, completadas, canceladas, citasHoy] = await Promise.all([
      prisma.cita.count({ where: { fecha: { gte: inicioMes } } }),
      prisma.cita.count({ where: { fecha: { gte: inicioMes }, estado: 'COMPLETADA' } }),
      prisma.cita.count({ where: { fecha: { gte: inicioMes }, estado: 'CANCELADA' } }),
      prisma.cita.count({ where: { fecha: { gte: inicioDia } } }),
    ]);

    const proximas24h = await prisma.cita.findMany({
      where: { fecha: { gte: ahora, lte: en24h }, estado: { not: 'CANCELADA' } },
      include: { cliente: { select: { fullName: true, email: true, phoneNumber: true } } },
      orderBy: { fecha: 'asc' }
    });

    const [porTipoRaw, porEstadoRaw] = await Promise.all([
      prisma.cita.groupBy({ by: ['tipoPropiedad'], _count: { id: true }, where: { fecha: { gte: inicioMes } } }),
      prisma.cita.groupBy({ by: ['estado'], _count: { id: true }, where: { fecha: { gte: inicioMes } } }),
    ]);

    // Evolución de citas por semana (8 semanas)
    const evolucionSemanas: Array<{ semana: string; total: number; completadas: number; canceladas: number }> = [];
    for (let i = 7; i >= 0; i--) {
      const ini = new Date(ahora.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const fin = new Date(ahora.getTime() - i       * 7 * 24 * 60 * 60 * 1000);
      const [total, comp, canc] = await Promise.all([
        prisma.cita.count({ where: { fecha: { gte: ini, lt: fin } } }),
        prisma.cita.count({ where: { fecha: { gte: ini, lt: fin }, estado: 'COMPLETADA' } }),
        prisma.cita.count({ where: { fecha: { gte: ini, lt: fin }, estado: 'CANCELADA' } }),
      ]);
      evolucionSemanas.push({ semana: `S${8 - i}`, total, completadas: comp, canceladas: canc });
    }

    return res.status(200).json({
      success: true,
      data: {
        totalMes, completadas, canceladas, citasHoy,
        tasaNoShow:     totalMes > 0 ? Math.round((canceladas  / totalMes) * 100) : 0,
        tasaConversion: totalMes > 0 ? Math.round((completadas / totalMes) * 100) : 0,
        proximas24h: proximas24h.map(c => ({
          id: c.id, fecha: c.fecha, tipoPropiedad: c.tipoPropiedad, estado: c.estado,
          notas: (c as any).notas || null,
          cliente: (c as any).cliente ? {
            fullName: (c as any).cliente.fullName,
            email: (c as any).cliente.email,
            phone: (c as any).cliente.phoneNumber
          } : null
        })),
        porTipo:  porTipoRaw.map(t => ({ tipo: t.tipoPropiedad, count: t._count.id })),
        porEstado: porEstadoRaw.map(e => ({ estado: e.estado, count: e._count.id })),
        evolucionSemanas
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── 5. KPIs DE CLIENTES ──
router.get('/kpis/clientes', authenticateJWT, async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!['SUPERADMIN', 'ADMIN', 'VENTAS'].includes(userRole || '')) {
      return res.status(403).json({ success: false, message: 'Acceso no autorizado' });
    }

    const ahora       = new Date();
    const inicioMes   = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioMesAnt = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnt   = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);

    const [totalClientes, nuevosEstesMes, nuevosMesAnterior, nuevosSemana] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENTE' } }),
      prisma.user.count({ where: { role: 'CLIENTE', createdAt: { gte: inicioMes } } }),
      prisma.user.count({ where: { role: 'CLIENTE', createdAt: { gte: inicioMesAnt, lte: finMesAnt } } }),
      prisma.user.count({ where: { role: 'CLIENTE', createdAt: { gte: inicioSemana } } }),
    ]);

    const tendencia = nuevosMesAnterior > 0
      ? Math.round(((nuevosEstesMes - nuevosMesAnterior) / nuevosMesAnterior) * 100)
      : 0;

    // Crecimiento semanal (8 semanas)
    const crecimientoSemanas: Array<{ semana: string; nuevos: number }> = [];
    for (let i = 7; i >= 0; i--) {
      const ini = new Date(ahora.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const fin = new Date(ahora.getTime() - i       * 7 * 24 * 60 * 60 * 1000);
      const count = await prisma.user.count({ where: { role: 'CLIENTE', createdAt: { gte: ini, lt: fin } } });
      crecimientoSemanas.push({ semana: `S${8 - i}`, nuevos: count });
    }

    const clientesConCitas = await prisma.user.count({
      where: { role: 'CLIENTE', citas: { some: {} } }
    });

    const geoClientes = await prisma.visitor.groupBy({
      by: ['country'], _count: { id: true },
      where: { userId: { not: null }, country: { not: null } },
      orderBy: { _count: { id: 'desc' } }, take: 8
    });

    return res.status(200).json({
      success: true,
      data: {
        totalClientes, nuevosEstesMes, nuevosSemana, tendencia,
        clientesConCitas, clientesSinCitas: totalClientes - clientesConCitas,
        engagementRate: totalClientes > 0 ? Math.round((clientesConCitas / totalClientes) * 100) : 0,
        crecimientoSemanas,
        geoClientes: geoClientes.map(g => ({ country: g.country || 'Unknown', count: g._count.id }))
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
