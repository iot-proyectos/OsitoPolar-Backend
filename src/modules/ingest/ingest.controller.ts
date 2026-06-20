import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils';
import { IngestService } from './ingest.service';

const ingestService = new IngestService();

export class IngestController {
  static async reading(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ingestService.processReading(req.device!.id, req.body);
      sendSuccess(res, { success: true });
    } catch (error) {
      next(error);
    }
  }

  static async heartbeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ingestService.processHeartbeat(req.device!.id);
      sendSuccess(res, { success: true });
    } catch (error) {
      next(error);
    }
  }
}
