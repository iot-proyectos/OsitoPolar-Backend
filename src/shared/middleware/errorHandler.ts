import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils';
import { logger } from '../../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details.length > 0 ? err.details : undefined,
      },
    });
    return;
  }

  // Multer file size error
  if (err.message === 'File too large') {
    res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds the maximum allowed size',
      },
    });
    return;
  }

  // Prisma known errors
  if ((err as unknown as Record<string, unknown>).code === 'P2002') {
    const target = (err as unknown as Record<string, unknown>).meta as Record<string, unknown> | undefined;
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `Unique constraint violation on: ${target?.target || 'unknown field'}`,
      },
    });
    return;
  }

  if ((err as unknown as Record<string, unknown>).code === 'P2025') {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Record not found',
      },
    });
    return;
  }

  // Unexpected errors
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
};
