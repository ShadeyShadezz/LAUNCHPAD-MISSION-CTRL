import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    const { to, subject, text, partnerId } = await req.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: 'to, subject, and text are required' }, { status: 400 });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const accessToken = await oAuth2Client.getAccessToken();
    if (!accessToken || !accessToken.token) {
      throw new Error('No access token');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_SENDER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
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
