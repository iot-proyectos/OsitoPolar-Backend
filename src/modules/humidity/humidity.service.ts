import { AppError, parsePagination, buildPaginationMeta, paginationToSkipTake } from '../../shared/utils';
import { PaginationMeta } from '../../shared/types';
import { HumidityRepository } from './humidity.repository';
import { DeviceRepository } from '../device/device.repository';

export class HumidityService {
  private humidityRepository: HumidityRepository;
  private deviceRepository: DeviceRepository;

  constructor() {
    this.humidityRepository = new HumidityRepository();
    this.deviceRepository = new DeviceRepository();
  }

  async getLatest(
    deviceId: string,
    userId: string
  ): Promise<{ percentage: number; createdAt: Date } | null> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw AppError.notFound('Device not found');
    if (device.userId !== userId) throw AppError.forbidden('You do not own this device');

    const latest = await this.humidityRepository.findLatest(deviceId);
    if (!latest) return null;

    return { percentage: latest.percentage, createdAt: latest.createdAt };
  }

  async getHistory(
    deviceId: string,
    userId: string,
    query: { from?: string; to?: string; page?: string; limit?: string }
  ): Promise<{
    data: { id: string; percentage: number; createdAt: Date }[];
    meta: PaginationMeta;
  }> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw AppError.notFound('Device not found');
    if (device.userId !== userId) throw AppError.forbidden('You do not own this device');

    const pagination = parsePagination(query.page, query.limit);
    const { skip, take } = paginationToSkipTake(pagination);

    const result = await this.humidityRepository.findMany(deviceId, {
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      skip,
      take,
    });

    return {
      data: result.data.map((h) => ({
        id: h.id,
        percentage: h.percentage,
        createdAt: h.createdAt,
      })),
      meta: buildPaginationMeta(result.total, pagination),
    };
  }
}
