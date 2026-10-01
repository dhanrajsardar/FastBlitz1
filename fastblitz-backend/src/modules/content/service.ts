// src/modules/content/service.ts
import { prisma } from '../../config';

export async function getTrendingVideos(query: { page: number; limit: number; niche?: string; tag?: string }) {
  const where: any = {
    isActive: true
  };

  if (query.niche) {
    where.niche = query.niche;
  }

  // Note: Since tags is a stringified JSON array in SQLite, exact match might be tricky without json functions.
  // In postgres we could use jsonb array operations.
  // For SQLite dev compatibility we can use simple LIKE search
  if (query.tag) {
    where.tags = { contains: query.tag };
  }

  const [videos, total] = await Promise.all([
    prisma.trendingVideo.findMany({
      where,
      orderBy: { trendingScore: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.trendingVideo.count({ where }),
  ]);

  return {
    videos,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit)
  };
}
