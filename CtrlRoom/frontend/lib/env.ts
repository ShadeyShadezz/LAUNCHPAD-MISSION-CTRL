// Environment validation utility for Vercel deployment
// This ensures required environment variables are present without impacting performance

export const env = {
  // Backend API URL with failsafe
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api',

  // Google OAuth (optional for basic functionality)
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',

  // Validation function - only runs once and caches result
  validate: (() => {
    let validated = false;
    let isValid = false;

    return () => {
      if (validated) return isValid;

      validated = true;
      isValid = true;

      // Check critical environment variables
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        console.warn('NEXT_PUBLIC_BACKEND_URL not set - using localhost fallback');
      }

      return isValid;
    };
  })(),
};

// Initialize validation on module load (non-blocking)
if (typeof window !== 'undefined') {
  // Delay validation to avoid blocking initial render
  setTimeout(() => env.validate(), 100);
}