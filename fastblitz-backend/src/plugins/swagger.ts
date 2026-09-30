// src/plugins/swagger.ts
import { FastifyInstance } from 'fastify';
import { getEnv } from '../config';

const env = getEnv();

export async function swaggerPlugin(app: any) {
  await app.register((await import('@fastify/swagger')).default, {
    openapi: {
      info: { title: 'FastBlitz API', description: 'AI-powered short-form video generation and publishing platform', version: '1.0.0' },
      servers: [{ url: env.API_URL, description: 'Current environment' }],
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register((await import('@fastify/swagger-ui')).default, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
  });
}