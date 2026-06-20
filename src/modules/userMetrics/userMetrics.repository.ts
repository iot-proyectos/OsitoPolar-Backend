import { prisma } from '../../config';
import { UserMetrics, MetricType } from '@prisma/client';

export class UserMetricsRepository {
  async findByUserId(userId: string): Promise<UserMetrics[]> {
    return prisma.userMetrics.findMany({
      where: { userId },
      include: {
        device: {
          select: { id: true, name: true, serialNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserAndDevice(userId: string, deviceId: string): Promise<UserMetrics[]> {
    return prisma.userMetrics.findMany({
      where: { userId, deviceId },
      include: {
        device: {
          select: { id: true, name: true, serialNumber: true },
        },
      },
    });
  }

  async findById(id: string): Promise<UserMetrics | null> {
    return prisma.userMetrics.findUnique({
      where: { id },
    });
  }

  async findByDeviceId(deviceId: string): Promise<UserMetrics[]> {
    return prisma.userMetrics.findMany({
      where: { deviceId },
    });
  }

  async create(data: {
    userId: string;
    deviceId: string;
    inferior: number;
    superior: number;
    metricType: MetricType;
  }): Promise<UserMetrics> {
    return prisma.userMetrics.create({
      data,
      include: {
        device: {
          select: { id: true, name: true, serialNumber: true },
        },
      },
    });
  }

  async update(
    id: string,
    data: Partial<Pick<UserMetrics, 'inferior' | 'superior'>>
  ): Promise<UserMetrics> {
    return prisma.userMetrics.update({
      where: { id },
      data,
      include: {
        device: {
          select: { id: true, name: true, serialNumber: true },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.userMetrics.delete({
      where: { id },
    });
  }
}
