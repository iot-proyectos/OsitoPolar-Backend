import { PaginationParams, PaginationMeta } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(
  page?: string | number,
  limit?: string | number
): PaginationParams {
  let parsedPage = typeof page === 'string' ? parseInt(page, 10) : (page ?? DEFAULT_PAGE);
  let parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : (limit ?? DEFAULT_LIMIT);

  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = DEFAULT_PAGE;
  }

  if (isNaN(parsedLimit) || parsedLimit < 1) {
    parsedLimit = DEFAULT_LIMIT;
  }

  if (parsedLimit > MAX_LIMIT) {
    parsedLimit = MAX_LIMIT;
  }

  return { page: parsedPage, limit: parsedLimit };
}

export function buildPaginationMeta(
  total: number,
  params: PaginationParams
): PaginationMeta {
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
  };
}

export function paginationToSkipTake(params: PaginationParams): {
  skip: number;
  take: number;
} {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };
}
