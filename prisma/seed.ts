import { PrismaClient, TemplateType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.memeTemplate.upsert({
    where: { slug: 'brittany-broski-situationship' },
    update: {},
    create: {
      slug: 'brittany-broski-situationship',
      creatorHandle: '@brittany_broski',
      originalLikes: '1.4K',
      originalViews: '18.1K',
      originalHookText: 'When your situationship texts you for the first time in months and you\'re trying to decide how much self respect you have left',
      originalVideoUrl: 'https://media.aftermark.ai/usefastlane/memes/brittany_original.mp4',
      templateType: TemplateType.GREEN_SCREEN,
      foregroundCutoutUrl: 'https://media.aftermark.ai/usefastlane/memes/brittany_cutout_alpha.webm',
      defaultBrollUrl: 'https://media.aftermark.ai/usefastlane/broll/night_bridge_city.mp4',
      audioTrackUrl: 'https://media.aftermark.ai/usefastlane/audio/trending_sound_01.mp3',
      hookSyntaxFormula: 'When {product_name} has {clear_benefit} and a {relatable_resolution}',
    },
  });

  await prisma.memeTemplate.upsert({
    where: { slug: 'everyday-life-simplified-slideshow' },
    update: {},
    create: {
      slug: 'everyday-life-simplified-slideshow',
      creatorHandle: '@minimalist_life',
      originalLikes: '4.8K',
      originalViews: '52.3K',
      originalHookText: 'Stop checking the same information in five different places',
      originalVideoUrl: 'https://media.aftermark.ai/usefastlane/memes/desk_slideshow_orig.mp4',
      templateType: TemplateType.SLIDESHOW,
      foregroundCutoutUrl: '',
      defaultBrollUrl: 'https://media.aftermark.ai/usefastlane/broll/cozy_desk_lamp.jpg',
      audioTrackUrl: 'https://media.aftermark.ai/usefastlane/audio/lofi_study_beat.mp3',
      hookSyntaxFormula: 'Stop {common_frustrating_habit} when {product_name} exists',
    },
  });

  await prisma.memeTemplate.upsert({
    where: { slug: 'pedro-pascal-driving' },
    update: {},
    create: {
      slug: 'pedro-pascal-driving',
      creatorHandle: '@popculture_clips',
      originalLikes: '12.5K',
      originalViews: '180K',
      originalHookText: 'Life was good until I had to deal with customer support',
      originalVideoUrl: 'https://media.aftermark.ai/usefastlane/memes/pedro_original.mp4',
      templateType: TemplateType.GREEN_SCREEN,
      foregroundCutoutUrl: 'https://media.aftermark.ai/usefastlane/memes/pedro_cutout_alpha.webm',
      defaultBrollUrl: 'https://media.aftermark.ai/usefastlane/broll/sunset_highway.mp4',
      audioTrackUrl: 'https://media.aftermark.ai/usefastlane/audio/make_your_own_kind_of_music.mp3',
      hookSyntaxFormula: 'Me realizing {product_name} does {tedious_task} in 1 click',
    },
  });

  console.log('Meme templates seeded successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
