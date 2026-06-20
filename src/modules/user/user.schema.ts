import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
}).refine((data) => data.name !== undefined || data.email !== undefined, {
  message: 'At least one field (name or email) must be provided',
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
