import { Router } from 'express';
import { EnergyConsumptionController } from './energyConsumption.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { deviceIdParamSchema, historyQuerySchema } from './energyConsumption.schema';

const router = Router();

router.use(authMiddleware);

router.get('/:deviceId', validate(deviceIdParamSchema, 'params'), EnergyConsumptionController.getLatest);
router.get(
  '/:deviceId/history',
  validate(deviceIdParamSchema, 'params'),
  validate(historyQuerySchema, 'query'),
  EnergyConsumptionController.getHistory
);

export { router as energyConsumptionRoutes };
