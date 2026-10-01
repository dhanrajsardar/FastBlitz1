// src/modules/analytics/routes.ts
import { FastifyInstance } from 'fastify';
import { requirePermission } from '../../shared/middleware/auth';
import * as analyticsService from './service';
import { analyticsOverviewSchema, analyticsPostsSchema } from './schemas';

export async function registerRoutes(app: any) {
  app.get('/analytics/overview', { schema: analyticsOverviewSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const data = await analyticsService.getOverview(request.workspace.id, request.query);
    return reply.send(data);
  });

  app.get('/analytics/posts', { schema: analyticsPostsSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const data = await analyticsService.getPostsAnalytics(request.workspace.id, request.query);
    return reply.send(data);
  });
}
