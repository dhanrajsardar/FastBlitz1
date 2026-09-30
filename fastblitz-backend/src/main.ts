// src/main.ts
import { buildApp } from './app';
import { getEnv } from './config';

const env = getEnv();

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 FastBlitz API running on http://localhost:${env.PORT}`);
    console.log(`📚 API Docs: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();