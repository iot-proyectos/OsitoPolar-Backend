import { z } from 'zod';

export const createDeviceSchema = z.object({
    name: z.string().min(1, 'Device name is required').max(200),
    serialNumber: z.string().min(1, 'Serial number is required').max(100),
});

export const updateDeviceSchema = z.object({
    name: z.string().min(1).max(200),
});

export const deviceIdParamSchema = z.object({
    id: z.string().uuid('Invalid device ID'),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;