import { z } from 'zod';

export const deviceIdParamSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
});

export const historyQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
