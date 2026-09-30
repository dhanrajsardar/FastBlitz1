import { FastifyInstance } from 'fastify';
import { createCampaignSchema, campaignIdSchema, listCampaignsSchema, regenerateCampaignSchema } from './schemas';
import * as campaignService from './service';
import { requirePermission } from '../../shared/middleware/auth';

export async function registerRoutes(app: any) {
  app.post('/campaigns', { schema: createCampaignSchema, preHandler: [requirePermission('campaigns:create')] }, async (request: any, reply: any) => {
    const campaign = await campaignService.createCampaign({
      workspaceId: request.workspace.id,
      userId: request.user.id,
      ...request.body,
    });
    return reply.status(201).send({ campaign });
  });

  app.get('/campaigns', { schema: listCampaignsSchema, preHandler: [requirePermission('campaigns:read')] }, async (request: any, reply: any) => {
    const result = await campaignService.getCampaigns(request.workspace.id, request.query);
    return reply.send(result);
  });

  app.get('/campaigns/:id', { schema: campaignIdSchema, preHandler: [requirePermission('campaigns:read')] }, async (request: any, reply: any) => {
    const campaign = await campaignService.getCampaignById(request.params.id, request.workspace.id);
    return reply.send({ campaign });
  });

  app.post('/campaigns/:id/regenerate', { schema: regenerateCampaignSchema, preHandler: [requirePermission('campaigns:regenerate')] }, async (request: any, reply: any) => {
    const campaign = await campaignService.regenerateCampaign(request.params.id, request.workspace.id, request.body);
    return reply.send({ campaign });
  });

  app.delete('/campaigns/:id', { schema: campaignIdSchema, preHandler: [requirePermission('campaigns:delete')] }, async (request: any, reply: any) => {
    await campaignService.deleteCampaign(request.params.id, request.workspace.id);
    return reply.send({ success: true });
  });
}