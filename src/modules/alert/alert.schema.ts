import { z } from 'zod';

export const alertQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isRead: z.enum(['true', 'false']).optional(),
});

export const alertIdParamSchema = z.object({
  id: z.string().uuid('Invalid alert ID'),
});

export type AlertQuery = z.infer<typeof alertQuerySchema>;
