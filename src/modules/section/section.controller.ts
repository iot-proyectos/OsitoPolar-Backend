import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { AppError } from '../../shared/utils';
import { SectionService } from './section.service';

const sectionService = new SectionService();

export class SectionController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await sectionService.listByUser(req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw AppError.badRequest('Image file is required');
      }

      const result = await sectionService.create(req.user!.id, req.body, req.file);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await sectionService.getById(req.params.id as string, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await sectionService.update(
        req.params.id as string,
        req.user!.id,
        req.body,
        req.file
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await sectionService.delete(req.params.id as string, req.user!.id);
      sendSuccess(res, { message: 'Section deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
