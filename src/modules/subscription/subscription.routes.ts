import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { authMiddleware, validate } from '../../shared/middleware';
import { checkoutSchema } from './subscription.schema';

const router = Router();

router.get('/me', authMiddleware, SubscriptionController.getMySubscription);
router.post('/checkout', authMiddleware, validate(checkoutSchema), SubscriptionController.createCheckout);

export { router as subscriptionRoutes };
