// src/config/prisma.ts
import { PrismaClient } from '@prisma/client';
import { getEnv } from './env';

const env: any = getEnv();

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new (require('@prisma/client').PrismaClient)({ log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;