// src/modules/analytics/service.ts
import { prisma } from '../../config';

export async function getOverview(workspaceId: string, query: { startDate?: string; endDate?: string }) {
  const where: any = { workspaceId };
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = new Date(query.startDate);
    if (query.endDate) where.date.lte = new Date(query.endDate);
  }

  const metrics = await prisma.postAnalytics.aggregate({
    where,
    _sum: {
      views: true,
      likes: true,
      comments: true,
      shares: true,
    }
  });

  const totalPosts = await prisma.publishedPost.count({
    where: { workspaceId }
  });

  return {
    totalViews: metrics._sum.views || 0,
    totalLikes: metrics._sum.likes || 0,
    totalComments: metrics._sum.comments || 0,
    totalShares: metrics._sum.shares || 0,
    totalPosts,
  };
}

export async function getPostsAnalytics(workspaceId: string, query: { page: number; limit: number; platform?: string }) {
  const where: any = { workspaceId };
  if (query.platform) {
    where.platform = query.platform;
  }

  const [posts, total] = await Promise.all([
    prisma.publishedPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        analytics: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    }),
    prisma.publishedPost.count({ where })
  ]);

  return {
    posts: posts.map(p => ({
      ...p,
      latestMetrics: p.analytics[0] || null
    })),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit)
  };
}
