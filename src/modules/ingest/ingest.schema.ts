import { z } from 'zod';

export const readingSchema = z.object({
  celsius: z.number({ required_error: 'Temperature (celsius) is required' }),
  percentage: z.number({ required_error: 'Humidity (percentage) is required' }),
});

export type ReadingInput = z.infer<typeof readingSchema>;
