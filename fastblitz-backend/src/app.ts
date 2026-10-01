// src/app.ts
import { FastifyInstance } from 'fastify';
import { getEnv } from './config';
import { setupSocketIO } from './shared/socket';

const env = getEnv();

export async function buildApp(): Promise<any> {
  const app = (await import('fastify')).default({ logger: { level: env.LOG_LEVEL, transport: env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined } });

  // Register plugins
  const { sensiblePlugin } = await import('./plugins/sensible');
  const { corsPlugin } = await import('./plugins/cors');
  const { helmetPlugin } = await import('./plugins/helmet');
  const { jwtPlugin } = await import('./plugins/jwt');
  const { swaggerPlugin } = await import('./plugins/swagger');
  const { multipartPlugin } = await import('./plugins/multipart');
  const { validationPlugin } = await import('./shared/middleware/validation');
  const { authMiddleware } = await import('./shared/middleware/auth');

  await app.register(sensiblePlugin);
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(jwtPlugin);
  await app.register(swaggerPlugin);
  await app.register(multipartPlugin);
  await app.register(validationPlugin);
  await app.register(authMiddleware);

  // Register routes
  const { registerRoutes } = await import('./routes');
  await registerRoutes(app);

  // Setup Socket.IO
  await setupSocketIO(app);

  return app;
}