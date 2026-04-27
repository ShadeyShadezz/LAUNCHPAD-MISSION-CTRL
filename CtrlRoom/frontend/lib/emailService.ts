// Email service for handling email operations with Gmail API

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

interface DraftEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
}

// Store drafts in localStorage
const getDrafts = (): DraftEmail[] => {
  if (typeof window === 'undefined') return [];
  const drafts = localStorage.getItem('emailDrafts');
  return drafts ? JSON.parse(drafts) : [];
};

const saveDraft = (email: Omit<DraftEmail, 'id' | 'timestamp'>): DraftEmail => {
  const draft: DraftEmail = {
    ...email,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
  
  const drafts = getDrafts();
  drafts.push(draft);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('emailDrafts', JSON.stringify(drafts));
  }
  
  return draft;
};

const deleteDraft = (id: string) => {
  if (typeof window === 'undefined') return;
  const drafts = getDrafts().filter(d => d.id !== id);
  localStorage.setItem('emailDrafts', JSON.stringify(drafts));
};

// Send email via backend or Gmail API
const sendEmail = async (params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Check if user has Gmail authorization
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Try to send via Gmail API if authorized
    const gmailToken = localStorage.getItem('gmailToken');
    if (gmailToken) {
      return await sendViaGmailAPI(params, gmailToken);
    }

    // Fallback: send via backend
    return await sendViaBackend(params);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
};

const sendViaGmailAPI = async (params: SendEmailParams, gmailToken: string) => {
  // Create RFC 2822 formatted email
  const message = createMimeMessage(params);
  const encodedMessage = btoa(message).replace(/\+/g, '-').replace(/\//g, '_');

  try {
    const response = await fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gmailToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!response.ok) {
      throw new Error('Gmail API error');
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Gmail API error:', error);
    // Fallback to backend
    return await sendViaBackend(params);
  }
};

const sendViaBackend = async (params: SendEmailParams) => {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Backend email service error');
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Backend email error:', error);
    return {
      success: false,
      error: 'Email service unavailable',
    };
  }
};

const createMimeMessage = (params: SendEmailParams): string => {
  const boundary = 'boundary_' + Date.now();
  
  return [
    `From: ${localStorage.getItem('userEmail') || 'noreply@launchpad.com'}`,
    `To: ${params.to}`,
    `Subject: ${encodeSubject(params.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: text/plain; charset=utf-8`,
    'Content-Transfer-Encoding: base64',
    '',
    btoa(params.body),
  ].join('\r\n');
};

const encodeSubject = (subject: string): string => {
  return `=?UTF-8?B?${btoa(subject)}?=`;
};

// Google OAuth functions
const initiateGoogleAuth = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = 'https://www.googleapis.com/auth/gmail.send';
  const responseType = 'code';

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', responseType);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');

  window.location.href = authUrl.toString();
};

export { sendEmail, saveDraft, getDrafts, deleteDraft, initiateGoogleAuth, type DraftEmail };
