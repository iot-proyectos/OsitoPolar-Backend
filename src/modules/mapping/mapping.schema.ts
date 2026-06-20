import { z } from 'zod';

export const sectionIdParamSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID'),
});

export const mappingIdParamSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID'),
  id: z.string().uuid('Invalid mapping ID'),
});

export const batchMappingsSchema = z.object({
  mappings: z.array(
    z.object({
      deviceId: z.string().uuid('Invalid device ID'),
      x: z.number().min(0).max(100, 'X must be between 0 and 100'),
      y: z.number().min(0).max(100, 'Y must be between 0 and 100'),
    })
  ).min(0),
});

export type BatchMappingsInput = z.infer<typeof batchMappingsSchema>;

export interface MappingItem {
  deviceId: string;
  x: number;
  y: number;
}
