import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  INFOSESSION: 'Infosession',
  TABLING: 'Tabling',
  MEETING: 'Meeting',
  OUTREACH: 'Outreach',
  INTERVIEWS: 'Interviews',
  STUDENT_APPLICATION: 'Student Application',
};

export async function GET(req: Request) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contacts: true,
        interactions: {
          include: {
            staff: { select: { id: true, fullName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    const enriched = partners.map((partner) => ({
      ...partner,
      interactions: partner.interactions.map((ix) => ({
        id: ix.id,
        interactionType: ix.interactionType,
        interactionLabel: INTERACTION_TYPE_LABELS[ix.interactionType] || ix.interactionType,
        date: ix.date,
        studentCount: ix.studentCount,
        sharedNotes: ix.sharedNotes,
        needsFollowup: ix.needsFollowup,
        followupDueDate: ix.followupDueDate,
        createdAt: ix.createdAt,
        staffName: ix.staff?.fullName || 'Unknown',
        staffEmail: ix.staff?.email || '',
      })),
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch partnerships:', error);
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 });
  }
}
