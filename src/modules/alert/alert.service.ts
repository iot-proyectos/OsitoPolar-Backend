import { AlertType, MetricType } from '@prisma/client';
import { logger } from '../../config';
import { AppError, parsePagination, buildPaginationMeta, paginationToSkipTake } from '../../shared/utils';
import { PaginationMeta } from '../../shared/types';
import { AlertRepository } from './alert.repository';
import { UserMetricsRepository } from '../userMetrics/userMetrics.repository';
import { DeviceRepository } from '../device/device.repository';

export class AlertService {
  private alertRepository: AlertRepository;
  private metricsRepository: UserMetricsRepository;
  private deviceRepository: DeviceRepository;

  constructor() {
    this.alertRepository = new AlertRepository();
    this.metricsRepository = new UserMetricsRepository();
    this.deviceRepository = new DeviceRepository();
  }

  async getAlerts(
    userId: string,
    query: { page?: string; limit?: string; isRead?: string }
  ): Promise<{
    data: unknown[];
    meta: PaginationMeta;
  }> {
    const pagination = parsePagination(query.page, query.limit);
    const { skip, take } = paginationToSkipTake(pagination);

    const isRead = query.isRead !== undefined ? query.isRead === 'true' : undefined;

    const result = await this.alertRepository.findByUserId(userId, {
      skip,
      take,
      isRead,
    });

    return {
      data: result.data,
      meta: buildPaginationMeta(result.total, pagination),
    };
  }

  async markAsRead(alertId: string, userId: string): Promise<unknown> {
    const alert = await this.alertRepository.findById(alertId);
    if (!alert) throw AppError.notFound('Alert not found');
    if (alert.userId !== userId) throw AppError.forbidden('You do not own this alert');

    return this.alertRepository.markAsRead(alertId);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.alertRepository.markAllAsRead(userId);
    return { count };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.alertRepository.getUnreadCount(userId);
    return { count };
  }

  async checkThresholds(
    deviceId: string,
    celsius: number,
    percentage: number
  ): Promise<void> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device || !device.userId) return;

    const metrics = await this.metricsRepository.findByDeviceId(deviceId);

    for (const metric of metrics) {
      if (metric.metricType === MetricType.TEMPERATURE) {
        if (celsius > metric.superior) {
          await this.alertRepository.create({
            type: AlertType.TEMP_HIGH,
            message: `Temperatura de '${device.name}' superó el máximo (${metric.superior}°C): ${celsius}°C`,
            value: celsius,
            threshold: metric.superior,
            userId: metric.userId,
            deviceId,
          });
          logger.info(`Alert TEMP_HIGH: device ${device.name}, value ${celsius}, threshold ${metric.superior}`);
        }

        if (celsius < metric.inferior) {
          await this.alertRepository.create({
            type: AlertType.TEMP_LOW,
            message: `Temperatura de '${device.name}' bajó del mínimo (${metric.inferior}°C): ${celsius}°C`,
            value: celsius,
            threshold: metric.inferior,
            userId: metric.userId,
            deviceId,
          });
          logger.info(`Alert TEMP_LOW: device ${device.name}, value ${celsius}, threshold ${metric.inferior}`);
        }
      }

      if (metric.metricType === MetricType.HUMIDITY) {
        if (percentage > metric.superior) {
          await this.alertRepository.create({
            type: AlertType.HUMIDITY_HIGH,
            message: `Humedad de '${device.name}' superó el máximo (${metric.superior}%): ${percentage}%`,
            value: percentage,
            threshold: metric.superior,
            userId: metric.userId,
            deviceId,
          });
          logger.info(`Alert HUMIDITY_HIGH: device ${device.name}, value ${percentage}, threshold ${metric.superior}`);
        }

        if (percentage < metric.inferior) {
          await this.alertRepository.create({
            type: AlertType.HUMIDITY_LOW,
            message: `Humedad de '${device.name}' bajó del mínimo (${metric.inferior}%): ${percentage}%`,
            value: percentage,
            threshold: metric.inferior,
            userId: metric.userId,
            deviceId,
          });
          logger.info(`Alert HUMIDITY_LOW: device ${device.name}, value ${percentage}, threshold ${metric.inferior}`);
        }
      }
    }
  }
}
