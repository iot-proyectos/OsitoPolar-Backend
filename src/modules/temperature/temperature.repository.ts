import { prisma } from '../../config';
import { Temperature, Prisma } from '@prisma/client';

export class TemperatureRepository {
  async findLatest(deviceId: string): Promise<Temperature | null> {
    return prisma.temperature.findFirst({
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
  ): Promise<{ data: Temperature[]; total: number }> {
    const where: Prisma.TemperatureWhereInput = { deviceId };

    if (options.from || options.to) {
      where.createdAt = {};
      if (options.from) where.createdAt.gte = options.from;
      if (options.to) where.createdAt.lte = options.to;
    }

    const [data, total] = await Promise.all([
      prisma.temperature.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take,
      }),
      prisma.temperature.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: { celsius: number; deviceId: string }): Promise<Temperature> {
    return prisma.temperature.create({ data });
  }
}
