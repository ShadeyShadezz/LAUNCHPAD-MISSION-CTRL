'use server';

import { Resend } from 'resend';
import { config } from '@/app/lib/config';

export async function sendEmailAction({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (!config.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(config.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: config.EMAIL_SENDER,
    to,
    subject,
    text,
  });

  if (error) {
    throw new Error('Failed to send email. Please try again later.');
  }
}
