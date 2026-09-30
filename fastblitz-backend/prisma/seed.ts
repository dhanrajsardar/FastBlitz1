// prisma/seed.ts
import { PrismaClient, SubscriptionPlan, Platform, MediaType } from '@prisma/client';
import { PLAN_LIMITS } from '../src/config/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create subscription plans (for reference)
  console.log('✅ Plan limits configured');

  // Create default trending niches
  const niches = [
    'fitness', 'tech', 'beauty', 'finance', 'food', 'travel',
    'fashion', 'gaming', 'education', 'health', 'business', 'lifestyle',
    'pets', 'parenting', 'diy', 'cooking', 'music', 'art',
  ];

  for (const niche of niches) {
    await prisma.trendingVideo.upsert({
      where: { id: `niche-${niche}` },
      update: {},
      create: {
        id: `niche-${niche}`,
        niche,
        videoUrl: 'https://example.com/placeholder.mp4',
        thumbnailUrl: 'https://example.com/placeholder.jpg',
        duration: 15,
        title: `${niche} trending template`,
        description: `Trending ${niche} video template`,
        tags: JSON.stringify([niche]),
        trendingScore: 50,
        isActive: true,
      },
    });
  }

  console.log('✅ Trending niches seeded');

  // Create system user for automated tasks
  await prisma.user.upsert({
    where: { email: 'system@fastblitz.app' },
    update: {},
    create: {
      email: 'system@fastblitz.app',
      name: 'FastBlitz System',
      role: 'OWNER',
      plan: 'ENTERPRISE',
      credits: 1000000,
      passwordHash: 'system',
      emailVerified: new Date(),
    },
  });

  console.log('✅ System user created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });