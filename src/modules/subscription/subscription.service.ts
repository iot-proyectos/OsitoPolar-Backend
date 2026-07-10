import { SubType } from '@prisma/client';
import { stripe } from '../../config';
import { env, logger } from '../../config';
import { prisma } from '../../config';
import { AppError } from '../../shared/utils';
import { SubscriptionRepository } from './subscription.repository';
import { CheckoutInput } from './subscription.schema';
import Stripe from 'stripe';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async getMySubscription(userId: string): Promise<unknown> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      return { type: 'NONE', expiresAt: null };
    }

    return {
      id: subscription.id,
      type: subscription.type,
      expiresAt: subscription.expiresAt,
      createdAt: subscription.createdAt,
    };
  }

  async createCheckoutSession(
    userId: string,
    input: CheckoutInput
  ): Promise<{ url: string }> {
    // Validate Stripe is configured
    if (!env.stripe.secretKey || env.stripe.secretKey.includes('placeholder')) {
      throw AppError.internal('Stripe is not configured. Please contact support.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) throw AppError.notFound('User not found');

    const priceMap: Record<string, string> = {
      BOUGHT: env.stripe.priceIds.bought,
      RENTING: env.stripe.priceIds.renting,
      BUSINESS: env.stripe.priceIds.business,
    };

    const priceId = priceMap[input.planType];
    if (!priceId || priceId.includes('placeholder')) {
      throw AppError.internal('Stripe price configuration is incomplete. Please contact support.');
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const isBought = input.planType === 'BOUGHT';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isBought ? 'payment' : 'subscription',
      success_url: `${env.cors.origin}/dashboard?checkout=success`,
      cancel_url: `${env.cors.origin}/dashboard?checkout=cancelled`,
      metadata: {
        userId: user.id,
        planType: input.planType,
      },
    });

    if (!session.url) {
      throw AppError.internal('Failed to create checkout session');
    }

    return { url: session.url };
  }

  async handleWebhook(
    body: Buffer,
    signature: string
  ): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.stripe.webhookSecret
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      throw AppError.badRequest('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType as SubType;

        if (userId && planType) {
          await this.subscriptionRepository.upsert(userId, {
            type: planType,
            stripeSubscriptionId: session.subscription as string | undefined,
            expiresAt: planType === 'BOUGHT' ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
          logger.info(`Subscription created for user ${userId}: ${planType}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.parent?.subscription_details?.subscription as string;

        if (subscriptionId) {
          const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(subscriptionId);
          if (subscription) {
            await this.subscriptionRepository.updateByStripeSubscriptionId(subscriptionId, {
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            logger.info(`Subscription renewed: ${subscriptionId}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(sub.id);

        if (subscription) {
          await this.subscriptionRepository.updateByStripeSubscriptionId(sub.id, {
            type: SubType.NONE,
          });
          logger.info(`Subscription cancelled: ${sub.id}`);
        }
        break;
      }

      default:
        logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }
}
