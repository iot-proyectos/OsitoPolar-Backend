import { z } from 'zod';

export const createUserMetricsSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  inferior: z.number({ required_error: 'Inferior threshold is required' }),
  superior: z.number({ required_error: 'Superior threshold is required' }),
  metricType: z.enum(['TEMPERATURE', 'HUMIDITY', 'ENERGY'], {
    errorMap: () => ({ message: 'Metric type must be TEMPERATURE, HUMIDITY, or ENERGY' }),
  }),
}).refine((data) => data.inferior < data.superior, {
  message: 'Inferior threshold must be less than superior threshold',
  path: ['inferior'],
});

export const updateUserMetricsSchema = z.object({
  inferior: z.number().optional(),
  superior: z.number().optional(),
}).refine((data) => data.inferior !== undefined || data.superior !== undefined, {
  message: 'At least one threshold must be provided',
});

export const metricsIdParamSchema = z.object({
  id: z.string().uuid('Invalid metrics ID'),
});

export const deviceIdParamSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
});

export type CreateUserMetricsInput = z.infer<typeof createUserMetricsSchema>;
export type UpdateUserMetricsInput = z.infer<typeof updateUserMetricsSchema>;
