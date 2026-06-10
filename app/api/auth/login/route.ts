import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
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

export async function POST(req: Request) {
  try {
    const jwtSecret = config.JWT_SECRET;
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
      jwtSecret,
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
    const message = error instanceof Error ? error.message : 'Unknown authentication error';
    console.error('Authentication route failed:', error);

    if (message.includes('Missing required environment variable: JWT_SECRET')) {
      return NextResponse.json(
        { error: 'Server auth is not configured. Set JWT_SECRET in Vercel environment variables.' },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError || /P1000|P1001|P1002|P1008|Can't reach database/i.test(message)) {
      return NextResponse.json(
        { error: 'Database connection failed. Verify DATABASE_URL in Vercel environment variables.' },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021' || error.code === 'P2022') {
        return NextResponse.json(
          { error: 'Database schema is out of sync with the app. Run `prisma migrate deploy` in your Vercel build.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
