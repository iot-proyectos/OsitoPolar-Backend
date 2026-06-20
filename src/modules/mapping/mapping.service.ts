import { prisma } from '../../config';
import { AppError } from '../../shared/utils';
import { MappingRepository } from './mapping.repository';
import { SectionRepository } from '../section/section.repository';
import { MappingItem } from './mapping.schema';

interface MappingWithDevice {
  id: string;
  x: number;
  y: number;
  deviceId: string;
  device: {
    id: string;
    name: string;
    serialNumber: string;
    status: string;
    lastSeenAt: Date | null;
  };
}

export class MappingService {
  private mappingRepository: MappingRepository;
  private sectionRepository: SectionRepository;

  constructor() {
    this.mappingRepository = new MappingRepository();
    this.sectionRepository = new SectionRepository();
  }

  async listBySectionId(sectionId: string, userId: string): Promise<unknown[]> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw AppError.notFound('Section not found');
    if (section.userId !== userId) throw AppError.forbidden('You do not own this section');

    const mappings = (await this.mappingRepository.findBySectionId(sectionId)) as unknown as MappingWithDevice[];

    // Enrich with latest readings
    const enriched = await Promise.all(
      mappings.map(async (mapping) => {
        const [lastTemp, lastHumidity] = await Promise.all([
          prisma.temperature.findFirst({
            where: { deviceId: mapping.deviceId },
            orderBy: { createdAt: 'desc' },
            select: { celsius: true, createdAt: true },
          }),
          prisma.humidity.findFirst({
            where: { deviceId: mapping.deviceId },
            orderBy: { createdAt: 'desc' },
            select: { percentage: true, createdAt: true },
          }),
        ]);

        return {
          id: mapping.id,
          x: mapping.x,
          y: mapping.y,
          device: {
            ...mapping.device,
            lastTemperature: lastTemp,
            lastHumidity: lastHumidity,
          },
        };
      })
    );

    return enriched;
  }

  async batchSave(
    sectionId: string,
    userId: string,
    mappings: MappingItem[]
  ): Promise<unknown[]> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw AppError.notFound('Section not found');
    if (section.userId !== userId) throw AppError.forbidden('You do not own this section');

    const result = await this.mappingRepository.batchUpsert(sectionId, mappings);

    return result.map((m) => ({
      id: m.id,
      x: m.x,
      y: m.y,
      deviceId: m.deviceId,
      sectionId: m.sectionId,
    }));
  }

  async deleteMapping(
    sectionId: string,
    mappingId: string,
    userId: string
  ): Promise<void> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw AppError.notFound('Section not found');
    if (section.userId !== userId) throw AppError.forbidden('You do not own this section');

    const mapping = await this.mappingRepository.findById(mappingId);
    if (!mapping) throw AppError.notFound('Mapping not found');
    if (mapping.sectionId !== sectionId) throw AppError.badRequest('Mapping does not belong to this section');

    await this.mappingRepository.delete(mappingId);
  }
}
