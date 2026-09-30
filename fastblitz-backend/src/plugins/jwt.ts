// src/plugins/jwt.ts
import { FastifyInstance } from 'fastify';
import { getEnv } from '../config';

const env = getEnv();

export async function jwtPlugin(app: any) {
  await app.register((await import('@fastify/jwt')).default, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: env.JWT_ACCESS_EXPIRY, algorithm: 'RS256' },
    verify: { algorithms: ['RS256'] },
    cookie: { cookieName: 'accessToken', signed: false, httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production' },
  });

  const { default: jwt } = await import('jsonwebtoken');
  app.decorate('verifyRefreshToken', async (token: string) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['RS256'] });
  });
  app.decorate('signRefreshToken', async (payload: object) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY, algorithm: 'RS256' });
  });
}