import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    verifyAuth(req);
    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contacts: {
          select: { id: true, name: true, email: true, title: true, contactType: true },
        },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });
    return NextResponse.json(partners);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to fetch partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    const body = await req.json();

    if (!body.organizationName) {
      return NextResponse.json({ error: 'organizationName is required' }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        organizationName: body.organizationName,
        logoUrl: body.logoUrl || null,
        industry: body.industry || null,
        description: body.description || null,
        websiteUrl: body.websiteUrl || null,
        schoolType: body.schoolType || null,
        officialStatusDate: body.officialStatusDate ? new Date(body.officialStatusDate) : null,
        courseNumber: typeof body.courseNumber === 'number' ? body.courseNumber : null,
        partnerType: body.partnerType || null,
        partnerStatus: body.partnerStatus || 'Active',
        currentStatusNotes: body.currentStatusNotes || null,
        earlyReleaseForSeniors: Boolean(body.earlyReleaseForSeniors),
        tags: Array.isArray(body.tags) ? body.tags : [],
        createdById: user.id,
        contacts: body.contacts ? {
          create: body.contacts.map((c: { name: string; email: string; title?: string; contactType: string }) => ({
            name: c.name,
            email: c.email,
            title: c.title || null,
            contactType: c.contactType as any,
          })),
        } : undefined,
      },
      include: {
        contacts: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATED',
          targetType: 'Partner',
          targetId: partner.id,
          targetName: partner.organizationName,
          additionalInfo: `Created partner: ${partner.organizationName} (${partner.partnerType || 'No type'})`,
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to create partner:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
