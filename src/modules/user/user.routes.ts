import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { updateUserSchema } from './user.schema';

const router = Router();

router.use(authMiddleware);

router.get('/me', UserController.getProfile);
router.put('/me', validate(updateUserSchema), UserController.updateProfile);
router.delete('/me', UserController.deleteAccount);

export { router as userRoutes };
