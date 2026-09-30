import { FastifyInstance } from 'fastify';
import { processFALWebhook } from '../modules/campaign/workers';

export async function registerWebhookRoutes(app: any) {
  app.post('/webhooks/fal', async (request: any, reply: any) => {
    try {
      await processFALWebhook(request.body);
      return reply.send({ success: true });
    } catch (error: any) {
      console.error('FAL webhook error:', error);
      return reply.status(500).send({ error: error.message });
    }
  });

  app.post('/webhooks/stripe', async (request: any, reply: any) => {
    return reply.send({ received: true });
  });

  app.post('/webhooks/tiktok', async (request: any, reply: any) => {
    return reply.send({ success: true });
  });

  app.post('/webhooks/instagram', async (request: any, reply: any) => {
    return reply.send({ success: true });
  });

  app.post('/webhooks/youtube', async (request: any, reply: any) => {
    return reply.send({ success: true });
  });
}