// Centralized configuration — all env vars and constants in one place

function required(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export const config = {
  // JWT
  get JWT_SECRET(): string {
    return required('JWT_SECRET');
  },

  // Database
  get DATABASE_URL(): string {
    return required('DATABASE_URL');
  },

  // OpenAI
  get OPENAI_API_KEY(): string {
    return required('OPENAI_API_KEY');
  },
  AI_MODEL: 'gpt-4o-mini',

  // Resend API — used for sending emails
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',

  // Email sender
  EMAIL_SENDER: process.env.EMAIL_SENDER || process.env.EMAIL_FROM || '',

  // Server port (Express backend)
  PORT: parseInt(process.env.PORT || '5000', 10),

  // Frontend URL (CORS)
  FRONTEND_URL: process.env.FRONTEND_URL || '',

  // Token expiry
  JWT_EXPIRY: process.env.JWT_EXPIRATION || '7d',
  JWT_MAX_AGE_SECONDS: 60 * 60 * 24 * 7,

} as const;
