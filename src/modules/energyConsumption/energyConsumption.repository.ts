import { prisma } from '../../config';
import { EnergyConsumption, Prisma } from '@prisma/client';

export class EnergyConsumptionRepository {
  async findLatest(deviceId: string): Promise<EnergyConsumption | null> {
    return prisma.energyConsumption.findFirst({
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
  ): Promise<{ data: EnergyConsumption[]; total: number }> {
    const where: Prisma.EnergyConsumptionWhereInput = { deviceId };

    if (options.from || options.to) {
      where.createdAt = {};
      if (options.from) where.createdAt.gte = options.from;
      if (options.to) where.createdAt.lte = options.to;
    }

    const [data, total] = await Promise.all([
      prisma.energyConsumption.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take,
      }),
      prisma.energyConsumption.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: {
    watts: number;
    voltage?: number;
    current?: number;
    deviceId: string;
  }): Promise<EnergyConsumption> {
    return prisma.energyConsumption.create({ data });
  }
}
