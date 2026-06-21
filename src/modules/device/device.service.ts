import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../shared/utils';
import { DeviceRepository } from './device.repository';
import { CreateDeviceInput, UpdateDeviceInput } from './device.schema';

export class DeviceService {
  private deviceRepository: DeviceRepository;

  constructor() {
    this.deviceRepository = new DeviceRepository();
  }

  async listByUser(userId: string): Promise<unknown[]> {
    const devices = await this.deviceRepository.findByUserId(userId);
    return devices.map((d) => ({
      id: d.id,
      name: d.name,
      serialNumber: d.serialNumber,
      status: d.status,
      lastSeenAt: d.lastSeenAt,
      createdAt: d.createdAt,
    }));
  }

  async create(
    userId: string,
    input: CreateDeviceInput
  ): Promise<{
    id: string;
    name: string;
    serialNumber: string;
    apiKey: string;
    status: string;
    createdAt: Date;
  }> {
    const existing = await this.deviceRepository.findBySerialNumber(input.serialNumber);
    if (existing) {
      throw AppError.conflict('A device with this serial number already exists');
    }

    const apiKey = uuidv4();

    const device = await this.deviceRepository.create({
      name: input.name,
      serialNumber: input.serialNumber,
      apiKey,
      userId,
    });

    return {
      id: device.id,
      name: device.name,
      serialNumber: device.serialNumber,
      apiKey: device.apiKey,
      status: device.status,
      createdAt: device.createdAt,
    };
  }

  async getById(deviceId: string, userId: string): Promise<unknown> {
    const result = await this.deviceRepository.findByIdWithLatestReadings(deviceId);

    if (!result) {
      throw AppError.notFound('Device not found');
    }

    if (result.device.userId !== userId) {
      throw AppError.forbidden('You do not own this device');
    }

    return {
      id: result.device.id,
      name: result.device.name,
      serialNumber: result.device.serialNumber,
      status: result.device.status,
      lastSeenAt: result.device.lastSeenAt,
      createdAt: result.device.createdAt,
      lastTemperature: result.lastTemperature,
      lastHumidity: result.lastHumidity,
    };
  }

  async update(
    deviceId: string,
    userId: string,
    input: UpdateDeviceInput
  ): Promise<{
    id: string;
    name: string;
    serialNumber: string;
    status: string;
  }> {
    const device = await this.deviceRepository.findById(deviceId);

    if (!device) {
      throw AppError.notFound('Device not found');
    }

    if (device.userId !== userId) {
      throw AppError.forbidden('You do not own this device');
    }

    const updated = await this.deviceRepository.update(deviceId, { name: input.name });

    return {
      id: updated.id,
      name: updated.name,
      serialNumber: updated.serialNumber,
      status: updated.status,
    };
  }

  async delete(deviceId: string, userId: string): Promise<void> {
    const device = await this.deviceRepository.findById(deviceId);

    if (!device) {
      throw AppError.notFound('Device not found');
    }

    if (device.userId !== userId) {
      throw AppError.forbidden('You do not own this device');
    }

    await this.deviceRepository.softDelete(deviceId);
  }
}
