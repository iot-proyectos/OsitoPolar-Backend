import { prisma } from '../../config';
import { Section } from '@prisma/client';

export class SectionRepository {
  async findByUserId(userId: string): Promise<Section[]> {
    return prisma.section.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Section | null> {
    return prisma.section.findUnique({
      where: { id },
    });
  }

  async findByIdWithMappings(id: string): Promise<unknown> {
    return prisma.section.findUnique({
      where: { id },
      include: {
        mappings: {
          include: {
            device: {
              select: {
                id: true,
                name: true,
                serialNumber: true,
                status: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: {
    name: string;
    imageUrl: string;
    userId: string;
  }): Promise<Section> {
    return prisma.section.create({ data });
  }

  async update(id: string, data: Partial<Pick<Section, 'name' | 'imageUrl'>>): Promise<Section> {
    return prisma.section.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.section.delete({
      where: { id },
    });
  }
}
