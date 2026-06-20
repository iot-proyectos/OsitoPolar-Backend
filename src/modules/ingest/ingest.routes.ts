import { Router } from 'express';
import { IngestController } from './ingest.controller';
import { deviceAuthMiddleware, ingestLimiter, validate } from '../../shared/middleware';
import { readingSchema } from './ingest.schema';

const router = Router();

router.use(ingestLimiter);
router.use(deviceAuthMiddleware);

router.post('/reading', validate(readingSchema), IngestController.reading);
router.post('/heartbeat', IngestController.heartbeat);

export { router as ingestRoutes };
