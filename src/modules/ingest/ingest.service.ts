import { DeviceStatus } from '@prisma/client';
import { prisma } from '../../config';
import { TemperatureRepository } from '../temperature/temperature.repository';
import { HumidityRepository } from '../humidity/humidity.repository';
import { AlertService } from '../alert/alert.service';
import { DeviceRepository } from '../device/device.repository';
import { ReadingInput } from './ingest.schema';

export class IngestService {
  private temperatureRepository: TemperatureRepository;
  private humidityRepository: HumidityRepository;
  private alertService: AlertService;
  private deviceRepository: DeviceRepository;

  constructor() {
    this.temperatureRepository = new TemperatureRepository();
    this.humidityRepository = new HumidityRepository();
    this.alertService = new AlertService();
    this.deviceRepository = new DeviceRepository();
  }

  async processReading(
    deviceId: string,
    input: ReadingInput
  ): Promise<void> {
    const now = new Date();

    // Batch: update device status, create temperature & humidity records in parallel
    await Promise.all([
      this.deviceRepository.update(deviceId, {
        status: DeviceStatus.ONLINE,
        lastSeenAt: now,
      }),
      this.temperatureRepository.create({
        celsius: input.celsius,
        deviceId,
      }),
      this.humidityRepository.create({
        percentage: input.percentage,
        deviceId,
      }),
    ]);

    // Check thresholds asynchronously (non-blocking for the response)
    this.alertService
      .checkThresholds(deviceId, input.celsius, input.percentage)
      .catch((err) => {
        // Log but don't fail the ingestion
        console.error('Error checking thresholds:', err);
      });
  }

  async processHeartbeat(deviceId: string): Promise<void> {
    await this.deviceRepository.update(deviceId, {
      status: DeviceStatus.ONLINE,
      lastSeenAt: new Date(),
    });
  }
}
