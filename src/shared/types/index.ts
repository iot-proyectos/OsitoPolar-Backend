import { Role } from '@prisma/client';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export interface DevicePayload {
  id: string;
  userId: string | null;
  serialNumber: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}
