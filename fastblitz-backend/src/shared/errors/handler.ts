// src/shared/errors/handler.ts
import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError, ValidationError } from './index';
import { z } from 'zod';
import { getEnv } from '../../config';

const env = getEnv();

export function errorHandler(app: FastifyInstance) {
  app.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err: error, url: request.url, method: request.method }, 'Request error');

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message, details: error.details } });
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) } });
    }

    if (error.validation) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.validation.map((v: any) => ({ field: v.instancePath || 'body', message: v.message })) } });
    }

    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED' || error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
      return reply.status(401).send({ error: { code: 'TOKEN_EXPIRED', message: 'Access token expired' } });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } });
    }

    const isDevelopment = env.NODE_ENV === 'development';
    return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: isDevelopment ? error.message : 'An unexpected error occurred', details: isDevelopment ? error.stack : undefined } });
  });
}