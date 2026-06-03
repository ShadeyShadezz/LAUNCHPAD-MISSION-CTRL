import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    verifyAuth(req);
    const url = req.nextUrl;
    const action = url.searchParams.get('action');
    const targetType = url.searchParams.get('targetType');
    const staffId = url.searchParams.get('staffId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (action && action !== 'all') where.action = action;
    if (targetType && targetType !== 'all') where.targetType = targetType;
    if (staffId) where.userId = staffId;
    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {};
      if (startDate) createdAt.gte = new Date(startDate);
      if (endDate) createdAt.lte = new Date(endDate);
      where.createdAt = createdAt;
    }

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
    return NextResponse.json(logs);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}
