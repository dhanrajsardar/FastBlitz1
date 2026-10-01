// src/modules/content/service.ts
import { contentRepository, TrendingVideoQuery } from './repository';

export async function getTrendingVideos(query: TrendingVideoQuery) {
  const { videos, total } = await contentRepository.searchTrendingVideos(query);

  return {
    videos,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit)
  };
}
