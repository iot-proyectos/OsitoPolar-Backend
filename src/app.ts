import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { env, morganStream } from './config';
import { generalLimiter, errorHandler } from './shared/middleware';

// Route imports
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { deviceRoutes } from './modules/device/device.routes';
import { temperatureRoutes } from './modules/temperature/temperature.routes';
import { humidityRoutes } from './modules/humidity/humidity.routes';
import { energyConsumptionRoutes } from './modules/energyConsumption/energyConsumption.routes';
import { sectionRoutes } from './modules/section/section.routes';
import { mappingRoutes } from './modules/mapping/mapping.routes';
import { subscriptionRoutes } from './modules/subscription/subscription.routes';
import { SubscriptionController } from './modules/subscription/subscription.controller';
import { userMetricsRoutes } from './modules/userMetrics/userMetrics.routes';
import { alertRoutes } from './modules/alert/alert.routes';
import { ingestRoutes } from './modules/ingest/ingest.routes';

const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(hpp());

// CORS
app.use(cors({
  origin: env.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Key', 'stripe-signature'],
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', { stream: morganStream }));

// ============================================
// STRIPE WEBHOOK (must be before json parser)
// ============================================
app.post(
  '/api/v1/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  SubscriptionController.handleWebhook
);

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// ============================================
// RATE LIMITING (general)
// ============================================
app.use('/api/v1', generalLimiter);

// ============================================
// API ROUTES
// ============================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/temperature', temperatureRoutes);
app.use('/api/v1/humidity', humidityRoutes);
app.use('/api/v1/energy', energyConsumptionRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/sections/:sectionId/mappings', mappingRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/metrics', userMetricsRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/ingest', ingestRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

export { app };
