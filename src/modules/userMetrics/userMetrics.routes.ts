import { Router } from 'express';
import { UserMetricsController } from './userMetrics.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import {
  createUserMetricsSchema,
  updateUserMetricsSchema,
  metricsIdParamSchema,
  deviceIdParamSchema,
  apiKeyParamSchema,
} from './userMetrics.schema';

const router = Router();

router.get('/by-apikey/:apiKey', validate(apiKeyParamSchema, 'params'), UserMetricsController.getByApiKey);

router.use(authMiddleware);

router.get('/', UserMetricsController.getAll);
router.get('/device/:deviceId', validate(deviceIdParamSchema, 'params'), UserMetricsController.getByDevice);
router.post('/', validate(createUserMetricsSchema), UserMetricsController.create);
router.put('/:id', validate(metricsIdParamSchema, 'params'), validate(updateUserMetricsSchema), UserMetricsController.update);
router.delete('/:id', validate(metricsIdParamSchema, 'params'), UserMetricsController.delete);

export { router as userMetricsRoutes };
