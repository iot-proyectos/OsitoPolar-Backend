import { z } from 'zod';

export const checkoutSchema = z.object({
  planType: z.enum(['BOUGHT', 'RENTING', 'BUSINESS'], {
    errorMap: () => ({ message: 'Plan type must be BOUGHT, RENTING, or BUSINESS' }),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
