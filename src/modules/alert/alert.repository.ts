import { prisma } from '../../config';
import { Alert, AlertType, Prisma } from '@prisma/client';

export class AlertRepository {
  async findByUserId(
    userId: string,
    options: {
      skip: number;
      take: number;
      isRead?: boolean;
    }
  ): Promise<{ data: Alert[]; total: number }> {
    const where: Prisma.AlertWhereInput = { userId };

    if (options.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    const [data, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take,
      }),
      prisma.alert.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Alert | null> {
    return prisma.alert.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string): Promise<Alert> {
    return prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.alert.count({
      where: { userId, isRead: false },
    });
  }

  async create(data: {
    type: AlertType;
    message: string;
    value: number;
    threshold: number;
    userId: string;
    deviceId: string;
  }): Promise<Alert> {
    return prisma.alert.create({ data });
  }
}
