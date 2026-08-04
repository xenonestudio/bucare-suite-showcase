import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { env } from './config/env.config.js';
import { globalErrorHandler } from './shared/middlewares/errorHandler.middleware.js';
import { tracingMiddleware } from './shared/middlewares/tracing.middleware.js';
import { AppError } from './shared/errors/AppError.js';
import pinoHttp from 'pino-http';
import { logger } from './config/logger.config.js';
import usersRoutes from './modules/users/users.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import citasRoutes from './modules/citas/citas.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import siteContentRoutes from './modules/site-content/siteContent.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import path from 'path';

const app: Application = express();

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

// 3. Configuración estricta de CORS
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const sanitizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(sanitizedOrigin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new AppError(`Origen no permitido por la política CORS (${origin})`, 403, 'CORS_FORBIDDEN'));
      }
    },
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
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    service: 'bucare-backend',
  });
});

// 7. Registro de módulos de rutas de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/citas', citasRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/site-content', siteContentRoutes);
app.use('/api/v1/upload', uploadRoutes);



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
