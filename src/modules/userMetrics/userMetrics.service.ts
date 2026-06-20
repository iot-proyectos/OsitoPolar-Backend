import { AppError } from '../../shared/utils';
import { UserMetricsRepository } from './userMetrics.repository';
import { DeviceRepository } from '../device/device.repository';
import { CreateUserMetricsInput, UpdateUserMetricsInput } from './userMetrics.schema';

export class UserMetricsService {
  private metricsRepository: UserMetricsRepository;
  private deviceRepository: DeviceRepository;

  constructor() {
    this.metricsRepository = new UserMetricsRepository();
    this.deviceRepository = new DeviceRepository();
  }

  async getAllByUser(userId: string): Promise<unknown[]> {
    return this.metricsRepository.findByUserId(userId);
  }

  async getByDevice(userId: string, deviceId: string): Promise<unknown[]> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw AppError.notFound('Device not found');
    if (device.userId !== userId) throw AppError.forbidden('You do not own this device');

    return this.metricsRepository.findByUserAndDevice(userId, deviceId);
  }

  async create(userId: string, input: CreateUserMetricsInput): Promise<unknown> {
    const device = await this.deviceRepository.findById(input.deviceId);
    if (!device) throw AppError.notFound('Device not found');
    if (device.userId !== userId) throw AppError.forbidden('You do not own this device');

    return this.metricsRepository.create({
      userId,
      deviceId: input.deviceId,
      inferior: input.inferior,
      superior: input.superior,
      metricType: input.metricType,
    });
  }

  async update(
    metricsId: string,
    userId: string,
    input: UpdateUserMetricsInput
  ): Promise<unknown> {
    const metrics = await this.metricsRepository.findById(metricsId);
    if (!metrics) throw AppError.notFound('Metrics threshold not found');
    if (metrics.userId !== userId) throw AppError.forbidden('You do not own this metrics threshold');

    const updateData: { inferior?: number; superior?: number } = {};

    if (input.inferior !== undefined) updateData.inferior = input.inferior;
    if (input.superior !== undefined) updateData.superior = input.superior;

    // Validate that inferior < superior after update
    const newInferior = updateData.inferior ?? metrics.inferior;
    const newSuperior = updateData.superior ?? metrics.superior;
    if (newInferior >= newSuperior) {
      throw AppError.badRequest('Inferior threshold must be less than superior threshold');
    }

    return this.metricsRepository.update(metricsId, updateData);
  }

  async delete(metricsId: string, userId: string): Promise<void> {
    const metrics = await this.metricsRepository.findById(metricsId);
    if (!metrics) throw AppError.notFound('Metrics threshold not found');
    if (metrics.userId !== userId) throw AppError.forbidden('You do not own this metrics threshold');

    await this.metricsRepository.delete(metricsId);
  }
}
