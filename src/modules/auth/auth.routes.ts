import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate, authLimiter } from '../../shared/middleware';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schema';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', authLimiter, validate(refreshSchema), AuthController.refresh);
router.post('/logout', validate(logoutSchema), AuthController.logout);

export { router as authRoutes };
