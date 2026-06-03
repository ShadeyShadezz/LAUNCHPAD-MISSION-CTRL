'use server';

import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export async function sendEmailAction({ to, subject, text }: { to: string; subject: string; text: string }) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  let accessToken;
  try {
    accessToken = await oAuth2Client.getAccessToken();
    if (!accessToken || !accessToken.token) {
      throw new Error('No access token');
    }
  } catch {
    throw new Error('Authentication with Google failed. Please check your connection.');
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

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to,
      subject,
      text,
    });
  } catch {
    throw new Error('Failed to send email. Please try again later.');
  }
}
