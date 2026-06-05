import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    const { fullName, role } = await req.json();
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(role !== undefined && { role }),
      },
      select: { id: true, fullName: true, email: true, role: true },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'EDITED',
          targetType: 'Staff',
          targetId: updated.id,
          targetName: updated.fullName,
          additionalInfo: `Updated staff: ${fullName ? `name=${fullName}, ` : ''}${role ? `role=${role}` : ''}`.replace(/,\s*$/, ''),
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to update staff:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }
    const { id } = await params;
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    await prisma.user.delete({ where: { id } });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'DELETED',
          targetType: 'Staff',
          targetId: id,
          targetName: existing.fullName,
          additionalInfo: `Deleted staff account: ${existing.email}`,
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to delete staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
