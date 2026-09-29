import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth/getSession';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { session } = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Try to safely access metadata depending on if this is real supabase user or mock
    const userMeta = (session.user as any).user_metadata;
    const name = userMeta?.full_name || 'User';

    // Upsert user to ensure they exist in DB
    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {},
      create: {
        id: session.user.id,
        email: session.user.email || 'mock@example.com',
        name
      }
    });

    // Create or find workspace
    let workspace = await prisma.workspace.findFirst({
      where: { userId: user.id }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          userId: user.id
        }
      });
    }

    // Create brand profile
    const profile = await prisma.brandProfile.create({
      data: {
        workspaceId: workspace.id,
        websiteUrl: url,
        companyName: new URL(url).hostname,
        targetAudience: 'General Audience',
        brandVoice: 'Professional'
      }
    });

    return NextResponse.json({ success: true, workspace, profile });

  } catch (error) {
    console.error('Failed to onboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
