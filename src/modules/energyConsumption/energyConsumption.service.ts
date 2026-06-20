import { AppError, parsePagination, buildPaginationMeta, paginationToSkipTake } from '../../shared/utils';
import { PaginationMeta } from '../../shared/types';
import { EnergyConsumptionRepository } from './energyConsumption.repository';
import { DeviceRepository } from '../device/device.repository';

export class EnergyConsumptionService {
  private energyRepository: EnergyConsumptionRepository;
  private deviceRepository: DeviceRepository;

  constructor() {
    this.energyRepository = new EnergyConsumptionRepository();
    this.deviceRepository = new DeviceRepository();
  }

  async getLatest(
    deviceId: string,
    userId: string
  ): Promise<{
    watts: number;
    voltage: number | null;
    current: number | null;
    createdAt: Date;
  } | null> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw AppError.notFound('Device not found');
    if (device.userId !== userId) throw AppError.forbidden('You do not own this device');

    const latest = await this.energyRepository.findLatest(deviceId);
    if (!latest) return null;

    return {
      watts: latest.watts,
      voltage: latest.voltage,
      current: latest.current,
      createdAt: latest.createdAt,
    };
  }

  async getHistory(
    deviceId: string,
    userId: string,
    query: { from?: string; to?: string; page?: string; limit?: string }
  ): Promise<{
    data: {
      id: string;
      watts: number;
      voltage: number | null;
      current: number | null;
      createdAt: Date;
    }[];
    meta: PaginationMeta;
  }> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw AppError.notFound('Device not found');
    if (device.userId !== userId) throw AppError.forbidden('You do not own this device');

    const pagination = parsePagination(query.page, query.limit);
    const { skip, take } = paginationToSkipTake(pagination);

    const result = await this.energyRepository.findMany(deviceId, {
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      skip,
      take,
    });

    return {
      data: result.data.map((e) => ({
        id: e.id,
        watts: e.watts,
        voltage: e.voltage,
        current: e.current,
        createdAt: e.createdAt,
      })),
      meta: buildPaginationMeta(result.total, pagination),
    };
  }
}
