import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: PaginationMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details: unknown[] = []
): void {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details: details.length > 0 ? details : undefined,
    },
  };

  res.status(statusCode).json(response);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
