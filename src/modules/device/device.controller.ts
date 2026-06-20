import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { DeviceService } from './device.service';

const deviceService = new DeviceService();

export class DeviceController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await deviceService.listByUser(req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await deviceService.create(req.user!.id, req.body);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await deviceService.getById(req.params.id as string, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await deviceService.update(req.params.id as string, req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deviceService.delete(req.params.id as string, req.user!.id);
      sendSuccess(res, { message: 'Device deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
