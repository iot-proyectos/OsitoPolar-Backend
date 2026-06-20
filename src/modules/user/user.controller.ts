import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { UserService } from './user.service';

const userService = new UserService();

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getProfile(req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteAccount(req.user!.id);
      sendSuccess(res, { message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
