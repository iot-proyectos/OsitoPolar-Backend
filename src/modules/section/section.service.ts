import { prisma, uploadToCloudinary, deleteFromCloudinary } from '../../config';
import { AppError } from '../../shared/utils';
import { SectionRepository } from './section.repository';
import { CreateSectionInput, UpdateSectionInput } from './section.schema';

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

interface SectionWithMappings {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  mappings: MappingWithDevice[];
}

export class SectionService {
  private sectionRepository: SectionRepository;

  constructor() {
    this.sectionRepository = new SectionRepository();
  }

  async listByUser(userId: string): Promise<unknown[]> {
    const sections = await this.sectionRepository.findByUserId(userId);
    return sections.map((s) => ({
      id: s.id,
      name: s.name,
      imageUrl: s.imageUrl,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async create(
    userId: string,
    input: CreateSectionInput,
    file: Express.Multer.File
  ): Promise<{
    id: string;
    name: string;
    imageUrl: string;
    createdAt: Date;
  }> {
    const { url } = await uploadToCloudinary(file.buffer, 'osito-polar/sections');

    const section = await this.sectionRepository.create({
      name: input.name,
      imageUrl: url,
      userId,
    });

    return {
      id: section.id,
      name: section.name,
      imageUrl: section.imageUrl,
      createdAt: section.createdAt,
    };
  }

  async getById(
    sectionId: string,
    userId: string
  ): Promise<unknown> {
    const section = (await this.sectionRepository.findByIdWithMappings(sectionId)) as SectionWithMappings | null;

    if (!section) {
      throw AppError.notFound('Section not found');
    }

    if (section.userId !== userId) {
      throw AppError.forbidden('You do not own this section');
    }

    const mappingsWithReadings = await Promise.all(
      section.mappings.map(async (mapping) => {
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

    return {
      id: section.id,
      name: section.name,
      imageUrl: section.imageUrl,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      mappings: mappingsWithReadings,
    };
  }

  async update(
    sectionId: string,
    userId: string,
    input: UpdateSectionInput,
    file?: Express.Multer.File
  ): Promise<{
    id: string;
    name: string;
    imageUrl: string;
    updatedAt: Date;
  }> {
    const section = await this.sectionRepository.findById(sectionId);

    if (!section) {
      throw AppError.notFound('Section not found');
    }

    if (section.userId !== userId) {
      throw AppError.forbidden('You do not own this section');
    }

    const updateData: { name?: string; imageUrl?: string } = {};

    if (input.name) {
      updateData.name = input.name;
    }

    if (file) {
      await deleteFromCloudinary(section.imageUrl);
      const { url } = await uploadToCloudinary(file.buffer, 'osito-polar/sections');
      updateData.imageUrl = url;
    }

    const updated = await this.sectionRepository.update(sectionId, updateData);

    return {
      id: updated.id,
      name: updated.name,
      imageUrl: updated.imageUrl,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(sectionId: string, userId: string): Promise<void> {
    const section = await this.sectionRepository.findById(sectionId);

    if (!section) {
      throw AppError.notFound('Section not found');
    }

    if (section.userId !== userId) {
      throw AppError.forbidden('You do not own this section');
    }

    await deleteFromCloudinary(section.imageUrl);
    await this.sectionRepository.delete(sectionId);
  }
}
