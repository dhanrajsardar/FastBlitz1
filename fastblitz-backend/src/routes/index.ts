// src/routes/index.ts
import { FastifyInstance } from 'fastify';

export async function registerRoutes(app: any) {
  const { registerRoutes: registerAuthRoutes } = await import('../modules/auth/routes');
  await registerAuthRoutes(app);

  const { registerRoutes: registerCampaignRoutes } = await import('../modules/campaign/routes');
  await registerCampaignRoutes(app);

  const { registerRoutes: registerSocialRoutes } = await import('../modules/social/routes');
  await registerSocialRoutes(app);

  const { registerRoutes: registerContentRoutes } = await import('../modules/content/routes');
  await registerContentRoutes(app);

  const { registerRoutes: registerSchedulingRoutes } = await import('../modules/scheduling/routes');
  await registerSchedulingRoutes(app);

  const { registerRoutes: registerAnalyticsRoutes } = await import('../modules/analytics/routes');
  await registerAnalyticsRoutes(app);

  const { registerWebhookRoutes } = await import('./webhooks');
  await registerWebhookRoutes(app);

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() }));
  app.get('/ready', async () => {
    const { prisma } = await import('../config');
    await prisma.$queryRaw`SELECT 1`;
    const { getRedisClient } = await import('../config');
    const redis = await getRedisClient();
    await redis.ping();
    return { status: 'ready', checks: { db: true, redis: true } };
  });
}