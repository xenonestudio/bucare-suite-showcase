import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { env } from './config/env.config.js';
import { globalErrorHandler } from './shared/middlewares/error.middleware.js';
import { tracingMiddleware } from './shared/middlewares/tracing.middleware.js';
import pinoHttp from 'pino-http';
import { logger } from './config/logger.config.js';
import { userRoutes } from './modules/users/user.routes.js';

const app: Application = express();

// 1. Cabeceras de seguridad HTTP (Helmet)
app.use(helmet());

// 2. Control de contaminación de parámetros HTTP (HPP)
app.use(hpp());

// 2.5. Tracing y Logging estructurado
app.use(tracingMiddleware);
app.use(pinoHttp({ logger }));

// 3. Configuración estricta de CORS
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por la política CORS'));
      }
    },
    credentials: true,
  })
);

// 4. Rate Limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos.',
    errorCode: 'TOO_MANY_REQUESTS',
  },
});
app.use('/api', limiter);

// 5. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
app.use('/api/v1/users', userRoutes);

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
