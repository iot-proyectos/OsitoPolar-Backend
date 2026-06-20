import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils';

type RequestField = 'body' | 'query' | 'params';

export const validate = (
  schema: ZodSchema,
  field: RequestField = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[field]);
      req[field] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(AppError.validation('Validation failed', details));
        return;
      }
      next(error);
    }
  };
};
