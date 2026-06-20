import { Router } from 'express';
import { DeviceController } from './device.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { createDeviceSchema, updateDeviceSchema, deviceIdParamSchema } from './device.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', DeviceController.list);
router.post('/', validate(createDeviceSchema), DeviceController.create);
router.get('/:id', validate(deviceIdParamSchema, 'params'), DeviceController.getById);
router.put('/:id', validate(deviceIdParamSchema, 'params'), validate(updateDeviceSchema), DeviceController.update);
router.delete('/:id', validate(deviceIdParamSchema, 'params'), DeviceController.delete);

export { router as deviceRoutes };
