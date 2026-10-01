// src/modules/publishing/workers.ts
import { createWorker, QUEUE_NAMES } from '../../shared/queue';
import { prisma } from '../../config';
import { getPublisher } from './strategies';
import { decryptToken } from '../social/crypto';

interface PublishJobData {
  scheduledPostId: string;
}

export async function processPublishingWorker() {
  await createWorker<PublishJobData>(QUEUE_NAMES.PUBLISHING_POST, async (job) => {
    const { scheduledPostId } = job.data;

    const post = await prisma.scheduledPost.findUnique({
      where: { id: scheduledPostId },
      include: {
        socialAccount: true,
        videoCandidate: true,
        contentItem: true
      }
    });

    if (!post) throw new Error(`ScheduledPost ${scheduledPostId} not found`);
    if (post.status === 'PUBLISHED') return; // Idempotent check

    try {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: 'PROCESSING' }
      });

      const publisher = getPublisher(post.platform);

      const accessToken = decryptToken(post.socialAccount.accessToken);
      const videoUrl = post.videoCandidate?.videoUrl || post.contentItem?.mediaUrl || '';

      if (!videoUrl) throw new Error('No video URL to publish');

      const result = await publisher.publish({
        accessToken,
        videoUrl,
        caption: post.caption || undefined,
        hashtags: post.hashtags ? JSON.parse(post.hashtags) : []
      });

      // Update ScheduledPost and Create PublishedPost
      await prisma.$transaction(async (tx) => {
        await tx.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            platformPostId: result.platformPostId,
            platformUrl: result.platformUrl,
          }
        });

        await tx.publishedPost.create({
          data: {
            scheduledPostId: post.id,
            workspaceId: post.workspaceId,
            socialAccountId: post.socialAccountId,
            platform: post.platform,
            platformPostId: result.platformPostId,
            platformUrl: result.platformUrl,
            caption: post.caption,
            hashtags: post.hashtags || '[]',
            mediaUrls: JSON.stringify([videoUrl]),
          }
        });
      });

    } catch (error: any) {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: {
          status: 'FAILED',
          platformError: error.message || 'Publishing failed',
          retryCount: { increment: 1 }
        }
      });
      // A full implementation would inspect error, queue retry if < maxRetries, etc.
      throw error; // Mark BullMQ job as failed
    }
  }, { concurrency: 5, limiter: { max: 10, duration: 1000 } }); // Respect basic API limits
}

export async function startPublishingWorkers() {
  await processPublishingWorker();
  console.log('✅ Publishing workers started');
}
