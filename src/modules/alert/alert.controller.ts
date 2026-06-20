import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { AlertService } from './alert.service';

const alertService = new AlertService();

export class AlertController {
  static async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, meta } = await alertService.getAlerts(
        req.user!.id,
        req.query as { page?: string; limit?: string; isRead?: string }
      );
      sendSuccess(res, data, 200, meta);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await alertService.markAsRead(req.params.id as string, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await alertService.markAllAsRead(req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await alertService.getUnreadCount(req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
