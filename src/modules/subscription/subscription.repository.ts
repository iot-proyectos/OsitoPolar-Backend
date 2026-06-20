import { prisma } from '../../config';
import { Subscription, SubType } from '@prisma/client';

export class SubscriptionRepository {
  async findByUserId(userId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { userId },
    });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });
  }

  async upsert(
    userId: string,
    data: {
      type: SubType;
      stripeSubscriptionId?: string;
      expiresAt?: Date;
    }
  ): Promise<Subscription> {
    return prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        type: data.type,
        stripeSubscriptionId: data.stripeSubscriptionId,
        expiresAt: data.expiresAt,
      },
      update: {
        type: data.type,
        stripeSubscriptionId: data.stripeSubscriptionId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    data: Partial<Pick<Subscription, 'type' | 'expiresAt'>>
  ): Promise<Subscription> {
    return prisma.subscription.update({
      where: { stripeSubscriptionId },
      data,
    });
  }
}
