import { prisma } from '../../config';
import { Mapping } from '@prisma/client';
import { MappingItem } from './mapping.schema';

export class MappingRepository {
  async findBySectionId(sectionId: string): Promise<Mapping[]> {
    return prisma.mapping.findMany({
      where: { sectionId },
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
    });
  }

  async findById(id: string): Promise<Mapping | null> {
    return prisma.mapping.findUnique({
      where: { id },
    });
  }

  async batchUpsert(
    sectionId: string,
    mappings: MappingItem[]
  ): Promise<Mapping[]> {
    return prisma.$transaction(async (tx) => {
      // Get current mappings
      const currentMappings = await tx.mapping.findMany({
        where: { sectionId },
      });

      const newDeviceIds = new Set(mappings.map((m) => m.deviceId));
      const currentDeviceIds = new Set(currentMappings.map((m) => m.deviceId));

      // Delete mappings that are no longer in the array
      const toDelete = currentMappings.filter((m) => !newDeviceIds.has(m.deviceId));
      if (toDelete.length > 0) {
        await tx.mapping.deleteMany({
          where: { id: { in: toDelete.map((m) => m.id) } },
        });
      }

      // Upsert each mapping
      const results: Mapping[] = [];
      for (const mapping of mappings) {
        const existing = currentMappings.find(
          (m) => m.deviceId === mapping.deviceId
        );

        if (existing) {
          // Update position
          const updated = await tx.mapping.update({
            where: { id: existing.id },
            data: { x: mapping.x, y: mapping.y },
          });
          results.push(updated);
        } else {
          // Create new
          const created = await tx.mapping.create({
            data: {
              sectionId,
              deviceId: mapping.deviceId,
              x: mapping.x,
              y: mapping.y,
            },
          });
          results.push(created);
        }
      }

      return results;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.mapping.delete({
      where: { id },
    });
  }
}
