import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    verifyAuth(req);
    const notes = await prisma.staffNote.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, fullName: true } } },
    });
    return NextResponse.json(notes);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch staff notes:', error);
    return NextResponse.json({ error: 'Failed to fetch staff notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    const { content } = await req.json();
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    const note = await prisma.staffNote.create({
      data: { content: content.trim(), authorId: user.id },
      include: { author: { select: { id: true, fullName: true } } },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATED',
          targetType: 'StaffNote',
          targetId: note.id,
          targetName: `Staff note by ${user.email}`,
          additionalInfo: content.trim().slice(0, 200),
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to create staff note:', error);
    return NextResponse.json({ error: 'Failed to create staff note' }, { status: 500 });
  }
}
