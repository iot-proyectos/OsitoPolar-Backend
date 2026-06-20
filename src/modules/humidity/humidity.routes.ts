import { Router } from 'express';
import { HumidityController } from './humidity.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { deviceIdParamSchema, historyQuerySchema } from './humidity.schema';

const router = Router();

router.use(authMiddleware);

router.get('/:deviceId', validate(deviceIdParamSchema, 'params'), HumidityController.getLatest);
router.get(
  '/:deviceId/history',
  validate(deviceIdParamSchema, 'params'),
  validate(historyQuerySchema, 'query'),
  HumidityController.getHistory
);

export { router as humidityRoutes };
