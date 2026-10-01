// src/modules/scheduling/routes.ts
import { FastifyInstance } from 'fastify';
import { requirePermission } from '../../shared/middleware/auth';
import * as schedulingService from './service';
import { listCardsSchema, actionCardSchema, listScheduleSchema, updateScheduleSchema, publishNowSchema } from './schemas';

export async function registerRoutes(app: any) {
  app.get('/blitz/cards', { schema: listCardsSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const limit = request.query.limit;
    const campaignId = request.query.campaignId;
    const cards = await schedulingService.getBlitzCards(request.workspace.id, limit, campaignId);
    return reply.send({ cards });
  });

  app.post('/blitz/action', { schema: actionCardSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const result = await schedulingService.handleCardAction(request.workspace.id, request.user.id, request.body);
    return reply.send({ success: true, result });
  });

  app.get('/schedule', { schema: listScheduleSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const posts = await schedulingService.listScheduledPosts(request.workspace.id, request.query);
    return reply.send({ posts });
  });

  app.patch('/schedule/:id', { schema: updateScheduleSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const post = await schedulingService.updateScheduledPost(request.workspace.id, request.params.id, request.body);
    return reply.send({ post });
  });

  app.post('/schedule/:id/publish-now', { schema: publishNowSchema, preHandler: [requirePermission('workspace:read')] }, async (request: any, reply: any) => {
    const result = await schedulingService.triggerPublishNow(request.workspace.id, request.params.id);
    return reply.send(result);
  });
}
