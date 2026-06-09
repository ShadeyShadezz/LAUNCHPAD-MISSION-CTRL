import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Session is no longer valid' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message.includes('Missing required environment variable: JWT_SECRET')) {
        return NextResponse.json(
          { error: 'Server auth is not configured. Set JWT_SECRET in Vercel environment variables.' },
          { status: 500 }
        );
      }
    }

    console.error('Session check failed:', error);
    return NextResponse.json({ error: 'Session check failed' }, { status: 500 });
  }
}
