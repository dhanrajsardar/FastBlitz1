// src/modules/content/routes.ts
import { FastifyInstance } from 'fastify';
import { requirePermission } from '../../shared/middleware/auth';
import * as contentService from './service';
import { listTrendingSchema } from './schemas';

export async function registerRoutes(app: any) {
  app.get('/library/trending', { schema: listTrendingSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const result = await contentService.getTrendingVideos(request.query);
    return reply.send(result);
  });
}
