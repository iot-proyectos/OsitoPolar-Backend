import { prisma } from '../../config';
import { Humidity, Prisma } from '@prisma/client';

export class HumidityRepository {
  async findLatest(deviceId: string): Promise<Humidity | null> {
    return prisma.humidity.findFirst({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMany(
    deviceId: string,
    options: {
      from?: Date;
      to?: Date;
      skip: number;
      take: number;
    }
  ): Promise<{ data: Humidity[]; total: number }> {
    const where: Prisma.HumidityWhereInput = { deviceId };

    if (options.from || options.to) {
      where.createdAt = {};
      if (options.from) where.createdAt.gte = options.from;
      if (options.to) where.createdAt.lte = options.to;
    }

    const [data, total] = await Promise.all([
      prisma.humidity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take,
      }),
      prisma.humidity.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: { percentage: number; deviceId: string }): Promise<Humidity> {
    return prisma.humidity.create({ data });
  }
}
