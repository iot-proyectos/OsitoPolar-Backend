import { Router } from 'express';
import { AlertController } from './alert.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { alertQuerySchema, alertIdParamSchema } from './alert.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(alertQuerySchema, 'query'), AlertController.getAlerts);
router.get('/unread-count', AlertController.getUnreadCount);
router.patch('/read-all', AlertController.markAllAsRead);
router.patch('/:id/read', validate(alertIdParamSchema, 'params'), AlertController.markAsRead);

export { router as alertRoutes };
