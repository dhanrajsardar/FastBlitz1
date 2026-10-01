// src/modules/scheduling/service.ts
import { prisma } from '../../config';
import { getQueue, QUEUE_NAMES } from '../../shared/queue';

export async function getBlitzCards(workspaceId: string, limit: number, campaignId?: string) {
  const where: any = {
    workspaceId,
    status: 'READY_FOR_REVIEW',
  };

  if (campaignId) {
    where.campaignId = campaignId;
  }

  const cards = await prisma.videoCandidate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return cards;
}

export async function handleCardAction(workspaceId: string, userId: string, data: {
  videoId: string;
  action: 'APPROVE' | 'REJECT';
  accountId?: string;
  scheduledFor?: string;
  caption?: string;
  hashtags?: string[];
}) {
  const video = await prisma.videoCandidate.findFirst({
    where: { id: data.videoId, workspaceId }
  });

  if (!video) throw new Error('Video not found');
  if (video.status !== 'READY_FOR_REVIEW') throw new Error('Video is not ready for review');

  if (data.action === 'REJECT') {
    return prisma.videoCandidate.update({
      where: { id: data.videoId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: userId,
      }
    });
  }

  // Handle APPROVE
  if (!data.accountId) throw new Error('accountId is required for APPROVE action');

  const account = await prisma.socialAccount.findFirst({
    where: { id: data.accountId, workspaceId }
  });
  if (!account) throw new Error('Social account not found');

  // Mark video as APPROVED
  await prisma.videoCandidate.update({
    where: { id: data.videoId },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedById: userId,
    }
  });

  // Create scheduled post
  const scheduledTime = data.scheduledFor ? new Date(data.scheduledFor) : new Date();

  const post = await prisma.scheduledPost.create({
    data: {
      workspaceId,
      userId,
      videoCandidateId: video.id,
      socialAccountId: account.id,
      platform: video.platform,
      caption: data.caption || video.description,
      hashtags: JSON.stringify(data.hashtags || JSON.parse(video.tags || '[]')),
      mentions: JSON.stringify([]),
      status: 'SCHEDULED',
      scheduledFor: scheduledTime,
    }
  });

  // If scheduled for now (or past), enqueue immediately
  // Otherwise, you could rely on a cron job or scheduled queue
  if (scheduledTime <= new Date()) {
    const queue = await getQueue(QUEUE_NAMES.PUBLISHING_POST);
    await queue.add('publish', { scheduledPostId: post.id });
  } else {
    // Optional: Use BullMQ delayed jobs
    const delay = scheduledTime.getTime() - Date.now();
    const queue = await getQueue(QUEUE_NAMES.PUBLISHING_POST);
    await queue.add('publish', { scheduledPostId: post.id }, { delay });
  }

  return post;
}

export async function listScheduledPosts(workspaceId: string, query: { status?: string; startDate?: string; endDate?: string }) {
  const where: any = { workspaceId };

  if (query.status) where.status = query.status;
  if (query.startDate || query.endDate) {
    where.scheduledFor = {};
    if (query.startDate) where.scheduledFor.gte = new Date(query.startDate);
    if (query.endDate) where.scheduledFor.lte = new Date(query.endDate);
  }

  return prisma.scheduledPost.findMany({
    where,
    orderBy: { scheduledFor: 'asc' },
    include: {
      socialAccount: { select: { platform: true, username: true, profileImageUrl: true } },
      videoCandidate: { select: { videoUrl: true, thumbnailUrl: true } },
      contentItem: { select: { mediaUrl: true, thumbnailUrl: true } }
    }
  });
}

export async function updateScheduledPost(workspaceId: string, id: string, data: {
  scheduledFor?: string;
  caption?: string;
  hashtags?: string[];
  status?: 'DRAFT' | 'SCHEDULED' | 'CANCELLED';
}) {
  const post = await prisma.scheduledPost.findFirst({ where: { id, workspaceId } });
  if (!post) throw new Error('Post not found');

  const updateData: any = {};
  if (data.scheduledFor) updateData.scheduledFor = new Date(data.scheduledFor);
  if (data.caption !== undefined) updateData.caption = data.caption;
  if (data.hashtags !== undefined) updateData.hashtags = JSON.stringify(data.hashtags);
  if (data.status) updateData.status = data.status;

  const updated = await prisma.scheduledPost.update({
    where: { id },
    data: updateData
  });

  // If rescheduled, could potentially manage BullMQ delayed jobs here

  return updated;
}

export async function triggerPublishNow(workspaceId: string, id: string) {
  const post = await prisma.scheduledPost.findFirst({ where: { id, workspaceId } });
  if (!post) throw new Error('Post not found');
  if (post.status === 'PUBLISHED') throw new Error('Post already published');

  const queue = await getQueue(QUEUE_NAMES.PUBLISHING_POST);
  await queue.add('publish', { scheduledPostId: post.id });

  await prisma.scheduledPost.update({
    where: { id },
    data: { status: 'PROCESSING' }
  });

  return { success: true, message: 'Publishing triggered' };
}
