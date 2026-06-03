import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/app/lib/db';
import { config } from '@/app/lib/config';

async function logActivity(userId: string, action: string, targetType: string, targetId?: string, targetName?: string) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, targetType, targetId, targetName },
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

const JWT_SECRET = config.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        fullName: true,
        title: true,
        accessLevel: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { passwordHash, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: config.JWT_MAX_AGE_SECONDS }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await logActivity(user.id, 'LOGGED_IN', 'User', user.id, user.email);

    const response = NextResponse.json({ success: true, user: userWithoutPassword, token });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: config.JWT_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    console.error('Authentication route failed:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
