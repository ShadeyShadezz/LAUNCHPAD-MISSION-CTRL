import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sanitizePromptValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[redacted-phone]')
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .slice(0, 600);
}

function safeTone(value: unknown): string {
  const allowed = new Set(['professional', 'formal', 'casual', 'enthusiastic']);
  const normalized = typeof value === 'string' ? value.toLowerCase().trim() : '';
  return allowed.has(normalized) ? normalized : 'professional';
}

export async function POST(req: Request) {
  let authUser: { id: string; email: string; role: string };
  try {
    authUser = verifyAuth(req);
    const { partnerId, customInstructions, tone, promptContext, subject: userSubject, recipientName, recipientEmail } = await req.json();

    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        organizationName: true,
        partnerType: true,
        partnerStatus: true,
        contacts: {
          select: { name: true, email: true, contactType: true, title: true },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    const organizationName = sanitizePromptValue(promptContext?.organizationName) || sanitizePromptValue(partner.organizationName);
    const purpose = sanitizePromptValue(promptContext?.purpose) || 'Partnership follow-up';
    const tier = sanitizePromptValue(partner.partnerType || promptContext?.tier) || 'Not specified';
    const selectedTone = safeTone(tone);
    const safeCustomInstructions = sanitizePromptValue(customInstructions) || 'No additional instructions provided.';
    const safeSubject = sanitizePromptValue(userSubject) || '';
    const safeRecipientName = sanitizePromptValue(recipientName) || '';
    const safeRecipientEmail = sanitizePromptValue(recipientEmail) || '';

    const promptParts: string[] = [
      'Write a concise outreach email draft for a partnership team.',
      'Do not include or request personal contact information.',
      'Do not include secrets, tokens, URLs, or credentials.',
      'Return ONLY valid JSON with keys: subject, emailBody.',
      '',
      `Organization: ${organizationName || 'Selected partner organization'}`,
      `Partner tier: ${tier}`,
      `Email purpose: ${purpose}`,
      `Tone: ${selectedTone}`,
    ];

    if (safeSubject) {
      promptParts.push(`Desired subject line: ${safeSubject}`);
    }
    if (safeRecipientName) {
      promptParts.push(`Recipient name: ${safeRecipientName}`);
    }
    if (safeRecipientEmail && safeRecipientEmail.includes('[redacted-email]')) {
      promptParts.push('Recipient email is available on file.');
    }
    promptParts.push(`Custom instructions: ${safeCustomInstructions}`);

    const prompt = promptParts.join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      store: false,
      messages: [
        {
          role: 'system',
          content:
            'You generate polished professional emails. Return strict JSON only with keys subject and emailBody. Never include personal data, credentials, or private identifiers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';

    let parsed: { subject?: string; emailBody?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { emailBody: raw };
    }

    try {
      await prisma.activityLog.create({
        data: {
          userId: authUser.id,
          action: 'CREATED',
          targetType: 'Email',
          targetName: `Email to ${partner.organizationName}`,
          additionalInfo: `Generated email for ${partner.organizationName} (subject: ${parsed.subject || safeSubject || 'No subject'})`,
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      subject: parsed.subject || safeSubject || '',
      emailBody: parsed.emailBody || parsed.subject || raw,
      text: parsed.emailBody || parsed.subject || raw,
    });
  } catch (error) {
    console.error('AI generation route failed');
    return NextResponse.json({ error: 'AI generation engine failed.' }, { status: 500 });
  }
}
