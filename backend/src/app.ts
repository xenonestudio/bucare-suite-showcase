import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';
import { env } from './config/env.config.js';
import { globalErrorHandler } from './shared/middlewares/errorHandler.middleware.js';
import { tracingMiddleware } from './shared/middlewares/tracing.middleware.js';
import pinoHttp from 'pino-http';
import { logger } from './config/logger.config.js';
import usersRoutes from './modules/users/users.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import citasRoutes from './modules/citas/citas.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import siteContentRoutes from './modules/site-content/siteContent.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js';
import visitsRoutes from './modules/visits/visits.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import path from 'path';

const app: Application = express();

// 0. Configurar trust proxy para funcionar detrás de LiteSpeed/cPanel/Nginx
// Necesario para que express-rate-limit identifique correctamente las IPs via X-Forwarded-For
app.set('trust proxy', 1);

// 0.5 Compresión gzip/brotli de respuestas HTTP para reducir transferencia de ancho de banda y uso de memoria
app.use(compression());

// 1. Cabeceras de seguridad HTTP (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. Control de contaminación de parámetros HTTP (HPP)
app.use(hpp());

// 2.5. Tracing y Logging estructurado
app.use(tracingMiddleware);
app.use(pinoHttp({ logger }));

// 3. Configuración flexible y segura de CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// 4. Rate Limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3000, // Permitir suficiente margen para polling de chat y llamadas del dashboard
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos.',
    errorCode: 'TOO_MANY_REQUESTS',
  },
});
app.use('/api', limiter);

// 5. Body Parsers (Aumentado a 20MB para subida de imágenes de alta resolución en base64)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));


// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// 6. Endpoint de verificación de estado (Healthcheck)
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    service: 'bucare-backend',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    service: 'bucare-backend',
  });
});

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    service: 'bucare-backend',
  });
});

// 7. Registro de módulos de rutas de la API (con y sin prefijo /api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/v1/users', usersRoutes);
app.use('/users', usersRoutes);

app.use('/api/v1/citas', citasRoutes);
app.use('/citas', citasRoutes);

app.use('/api/v1/chat', chatRoutes);
app.use('/chat', chatRoutes);

app.use('/api/v1/site-content', siteContentRoutes);
app.use('/site-content', siteContentRoutes);

app.use('/api/v1/upload', uploadRoutes);
app.use('/upload', uploadRoutes);

app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/whatsapp', whatsappRoutes);

app.use('/api/v1/visits', visitsRoutes);
app.use('/visits', visitsRoutes);

app.use('/api/v1/notifications', notificationsRoutes);
app.use('/notifications', notificationsRoutes);

import analyticsRoutes from './modules/analytics/analytics.routes.js';
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);




// 8. Manejador de rutas no encontradas (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'El recurso solicitado no fue encontrado en la API.',
    errorCode: 'ROUTE_NOT_FOUND',
  });
});

// 9. Middleware global centralizado de errores
app.use(globalErrorHandler);

export default app;
