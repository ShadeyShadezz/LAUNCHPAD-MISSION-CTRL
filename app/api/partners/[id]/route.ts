import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    verifyAuth(req);
    const { id } = await params;
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        contacts: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { staff: { select: { id: true, fullName: true } } },
        },
      },
    });
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    return NextResponse.json(partner);
  } catch (error) {
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    console.error('Failed to fetch partner:', error);
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const { contacts, ...partnerData } = body;

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        organizationName: partnerData.organizationName ?? existing.organizationName,
        logoUrl: partnerData.logoUrl ?? existing.logoUrl,
        industry: partnerData.industry ?? existing.industry,
        description: partnerData.description ?? existing.description,
        websiteUrl: partnerData.websiteUrl ?? existing.websiteUrl,
        schoolType: partnerData.schoolType ?? existing.schoolType,
        officialStatusDate: partnerData.officialStatusDate
          ? new Date(partnerData.officialStatusDate)
          : (partnerData.officialStatusDate === null ? null : existing.officialStatusDate),
        courseNumber: typeof partnerData.courseNumber === 'number'
          ? partnerData.courseNumber
          : (partnerData.courseNumber === null ? null : existing.courseNumber),
        partnerType: partnerData.partnerType ?? existing.partnerType,
        partnerStatus: partnerData.partnerStatus ?? existing.partnerStatus,
        currentStatusNotes: partnerData.currentStatusNotes ?? existing.currentStatusNotes,
        earlyReleaseForSeniors: typeof partnerData.earlyReleaseForSeniors === 'boolean'
          ? partnerData.earlyReleaseForSeniors
          : existing.earlyReleaseForSeniors,
        tags: Array.isArray(partnerData.tags) ? partnerData.tags : existing.tags,
      },
      include: { contacts: true },
    });

    if (Array.isArray(contacts)) {
      await prisma.contact.deleteMany({ where: { partnerId: id } });
      if (contacts.length > 0) {
        await prisma.contact.createMany({
          data: contacts.map((c: { name: string; email: string; title?: string; contactType: string }) => ({
            partnerId: id,
            name: c.name,
            email: c.email,
            title: c.title || null,
            contactType: c.contactType as any,
          })),
        });
      }
    }

    const result = await prisma.partner.findUnique({
      where: { id },
      include: { contacts: true },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'EDITED',
          targetType: 'Partner',
          targetId: id,
          targetName: result?.organizationName || existing.organizationName,
          additionalInfo: `Updated partner: ${result?.organizationName || existing.organizationName}`,
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Failed to update partner:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }
    const { id } = await params;
    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    await prisma.partner.delete({ where: { id } });

    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'DELETED',
          targetType: 'Partner',
          targetId: id,
          targetName: existing.organizationName,
          additionalInfo: `Deleted partner: ${existing.organizationName}`,
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
    console.error('Failed to delete partner:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
