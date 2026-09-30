// src/routes/v1/health.ts
import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: any) {
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() }));
  app.get('/ready', async () => {
    const { prisma } = await import('../../config');
    await prisma.$queryRaw`SELECT 1`;
    const { getRedisClient } = await import('../../config');
    const redis = await getRedisClient();
    await redis.ping();
    return { status: 'ready', checks: { db: true, redis: true } };
  });
}