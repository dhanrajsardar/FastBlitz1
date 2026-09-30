// src/shared/utils/pagination.ts
import { z } from 'zod';

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  orderBy: z.string().optional(),
  orderDir: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

export function createPaginatedResponse<T>(items: T[], limit: number, getCursor: (item: T) => string) {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? getCursor(data[data.length - 1]) : undefined;
  return { data, nextCursor, hasMore };
}