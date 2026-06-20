import { Router } from 'express';
import { MappingController } from './mapping.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { sectionIdParamSchema, mappingIdParamSchema, batchMappingsSchema } from './mapping.schema';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', validate(sectionIdParamSchema, 'params'), MappingController.list);
router.post(
  '/batch',
  validate(sectionIdParamSchema, 'params'),
  validate(batchMappingsSchema),
  MappingController.batchSave
);
router.delete(
  '/:id',
  validate(mappingIdParamSchema, 'params'),
  MappingController.delete
);

export { router as mappingRoutes };
