import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    verifyAuth(req);
    const staff = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        title: true,
      },
      orderBy: { fullName: 'asc' },
    });
    return NextResponse.json(staff);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user || user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const { fullName, email, role, title, password } = await req.json();
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const staff = await prisma.user.create({
      data: { fullName, email, passwordHash: hashedPassword, role: role || 'STAFF_USER', title: title || '' },
      select: { id: true, fullName: true, email: true, role: true, title: true },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATED',
          targetType: 'Staff',
          targetId: staff.id,
          targetName: fullName,
          additionalInfo: `Created staff account: ${email} (${role || 'STAFF_USER'})`,
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to create staff:', error);
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}
