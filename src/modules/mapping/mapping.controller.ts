import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { MappingService } from './mapping.service';

const mappingService = new MappingService();

export class MappingController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await mappingService.listBySectionId(
        req.params.sectionId as string,
        req.user!.id
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async batchSave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await mappingService.batchSave(
        req.params.sectionId as string,
        req.user!.id,
        req.body.mappings
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await mappingService.deleteMapping(
        req.params.sectionId as string,
        req.params.id as string,
        req.user!.id
      );
      sendSuccess(res, { message: 'Mapping deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
