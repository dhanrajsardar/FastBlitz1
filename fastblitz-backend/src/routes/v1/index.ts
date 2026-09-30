// src/routes/v1/index.ts
import { FastifyInstance } from 'fastify';

export async function registerV1Routes(app: any) {
  // Auth routes
  const { registerRoutes: registerAuthRoutes } = await import('../../modules/auth/routes');
  await registerAuthRoutes(app);
  
  // Placeholder for other routes
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
}