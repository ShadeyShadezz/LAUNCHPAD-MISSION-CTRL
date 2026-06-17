import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { Resend } from 'resend';
import { config } from '@/app/lib/config';

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    const { to, subject, text, partnerId } = await req.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: 'to, subject, and text are required' }, { status: 400 });
    }

    if (!config.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(config.RESEND_API_KEY);

    await resend.emails.send({
      from: config.EMAIL_SENDER,
      to,
      subject,
      text,
    });

    try {
      const partnerName = partnerId
        ? (await prisma.partner.findUnique({ where: { id: partnerId }, select: { organizationName: true } }))?.organizationName
        : null;

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'EDITED',
          targetType: 'Email',
          targetName: `Email sent to ${partnerName || to}`,
          additionalInfo: `Sent email to ${to} (subject: ${subject})`,
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
  }
}
