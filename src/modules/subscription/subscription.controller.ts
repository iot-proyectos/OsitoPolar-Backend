import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { AppError } from '../../shared/utils';
import { SubscriptionService } from './subscription.service';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  static async getMySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subscriptionService.getMySubscription(req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async createCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subscriptionService.createCheckoutSession(req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'];

      if (!signature || typeof signature !== 'string') {
        throw AppError.badRequest('Missing Stripe signature');
      }

      await subscriptionService.handleWebhook(req.body as Buffer, signature);
      sendSuccess(res, { received: true });
    } catch (error) {
      next(error);
    }
  }
}
