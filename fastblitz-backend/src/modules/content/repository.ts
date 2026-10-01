// src/modules/content/repository.ts
import { prisma } from '../../config';
import { TrendingVideo } from '@prisma/client';

export interface TrendingVideoQuery {
  page: number;
  limit: number;
  niche?: string;
  tag?: string;
}

export interface ContentRepository {
  searchTrendingVideos(query: TrendingVideoQuery): Promise<{ videos: TrendingVideo[]; total: number }>;
}

export class PrismaContentRepository implements ContentRepository {
  async searchTrendingVideos(query: TrendingVideoQuery): Promise<{ videos: TrendingVideo[]; total: number }> {
    const where: any = { isActive: true };

    if (query.niche) {
      where.niche = query.niche;
    }

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

    return { videos, total };
  }
}

// In the future:
// export class ElasticsearchContentRepository implements ContentRepository { ... }

export const contentRepository = new PrismaContentRepository();
