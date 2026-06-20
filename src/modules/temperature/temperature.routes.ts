import { Router } from 'express';
import { TemperatureController } from './temperature.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { deviceIdParamSchema, historyQuerySchema } from './temperature.schema';

const router = Router();

router.use(authMiddleware);

router.get('/:deviceId', validate(deviceIdParamSchema, 'params'), TemperatureController.getLatest);
router.get(
  '/:deviceId/history',
  validate(deviceIdParamSchema, 'params'),
  validate(historyQuerySchema, 'query'),
  TemperatureController.getHistory
);

export { router as temperatureRoutes };
