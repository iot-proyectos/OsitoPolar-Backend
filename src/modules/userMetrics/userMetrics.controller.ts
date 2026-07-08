import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { UserMetricsService } from './userMetrics.service';

const metricsService = new UserMetricsService();

export class UserMetricsController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await metricsService.getAllByUser(req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getByApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await metricsService.getByApiKey(req.params.apiKey as string);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getByDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await metricsService.getByDevice(req.user!.id, req.params.deviceId as string);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await metricsService.create(req.user!.id, req.body);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await metricsService.update(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await metricsService.delete(req.params.id as string, req.user!.id);
      sendSuccess(res, { message: 'Metrics threshold deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
