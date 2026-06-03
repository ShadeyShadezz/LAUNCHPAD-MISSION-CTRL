import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    verifyAuth(req);
    const interactions = await prisma.interaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, organizationName: true } },
        staff: { select: { id: true, fullName: true, email: true } },
      },
    });
    return NextResponse.json(interactions);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch interactions:', error);
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    const body = await req.json();

    if (!body.partnerId || !body.interactionType || !body.date) {
      return NextResponse.json({ error: 'partnerId, interactionType, and date are required' }, { status: 400 });
    }

    const interaction = await prisma.interaction.create({
      data: {
        partnerId: body.partnerId,
        interactionType: body.interactionType,
        staffId: user.id,
        date: new Date(body.date),
        studentCount: typeof body.studentCount === 'number' ? body.studentCount : 0,
        sharedNotes: body.sharedNotes || null,
        needsFollowup: body.needsFollowup || false,
        followupDueDate: body.followupDueDate ? new Date(body.followupDueDate) : null,
      },
      include: {
        partner: { select: { id: true, organizationName: true } },
        staff: { select: { id: true, fullName: true } },
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATED',
          targetType: 'Interaction',
          targetId: interaction.id,
          targetName: `Interaction with ${interaction.partner?.organizationName || 'Unknown'}`,
        },
      });
    } catch {
      // Non-critical — log failure shouldn't block the response
    }

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to create interaction:', error);
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 });
  }
}
