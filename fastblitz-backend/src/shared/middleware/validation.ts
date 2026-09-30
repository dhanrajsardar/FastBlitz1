// src/shared/middleware/validation.ts
import { FastifyInstance } from 'fastify';
import { z, ZodTypeAny } from 'zod';

declare module 'fastify' {
  interface FastifyRequest {
    validate<T>(schema: ZodTypeAny): T;
  }
}

export async function validationPlugin(app: any) {
  app.decorateRequest('validate', null);

  app.addHook('preHandler', (request: any, reply: any, done: () => void) => {
    request.validate = <T>(schema: ZodTypeAny): T => {
      const data = { body: request.body, query: request.query, params: request.params, headers: request.headers };
      const result = schema.safeParse(data);
      if (!result.success) {
        return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: result.error.errors } });
      }
      Object.assign(request.body, result.data.body);
      Object.assign(request.query, result.data.query);
      Object.assign(request.params, result.data.params);
      return result.data as T;
    };
    done();
  });
}