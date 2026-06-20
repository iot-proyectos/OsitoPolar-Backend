import { z } from 'zod';

export const createSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required').max(200),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

export const sectionIdParamSchema = z.object({
  id: z.string().uuid('Invalid section ID'),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
