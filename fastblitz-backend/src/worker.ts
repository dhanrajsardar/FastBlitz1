// src/worker.ts
import { getEnv } from './config';
import { startCampaignWorkers } from './modules/campaign/workers';
import { startPublishingWorkers } from './modules/publishing/workers';
// Import any other workers here

const env = getEnv();

async function startWorkers() {
  console.log(`👷 Starting FastBlitz Background Workers...`);
  try {
    await startCampaignWorkers();
    await startPublishingWorkers();
    console.log(`✅ All Background Workers started successfully.`);

    // Setup graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down workers...');
      const { shutdownAllWorkers } = await import('./shared/queue');
      await shutdownAllWorkers();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('❌ Failed to start workers:', err);
    process.exit(1);
  }
}

startWorkers();
