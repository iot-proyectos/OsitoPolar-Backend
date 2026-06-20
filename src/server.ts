import { app } from './app';
import { env, logger, prisma } from './config';
import { DeviceRepository } from './modules/device/device.repository';
import cron from 'node-cron';

const deviceRepository = new DeviceRepository();

// ============================================
// DEVICE STATUS CRON JOB
// Every 5 minutes, mark devices as OFFLINE if lastSeenAt > 3 minutes
// ============================================
cron.schedule('*/5 * * * *', async () => {
  try {
    const count = await deviceRepository.markOfflineDevices(3);
    if (count > 0) {
      logger.info(`Marked ${count} device(s) as OFFLINE`);
    }
  } catch (error) {
    logger.error('Error in device status cron:', error);
  }
});

// ============================================
// SERVER STARTUP
// ============================================
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    app.listen(env.port, () => {
      logger.info(`🚀 OsitoPolar backend running on port ${env.port}`);
      logger.info(`📡 Environment: ${env.nodeEnv}`);
      logger.info(`🔗 API Base URL: http://localhost:${env.port}/api/v1`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  logger.info('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();
