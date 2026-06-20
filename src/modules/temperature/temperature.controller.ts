import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { TemperatureService } from './temperature.service';

const temperatureService = new TemperatureService();

export class TemperatureController {
  static async getLatest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await temperatureService.getLatest(req.params.deviceId as string, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, meta } = await temperatureService.getHistory(
        req.params.deviceId as string,
        req.user!.id,
        req.query as { from?: string; to?: string; page?: string; limit?: string }
      );
      sendSuccess(res, data, 200, meta);
    } catch (error) {
      next(error);
    }
  }
}
