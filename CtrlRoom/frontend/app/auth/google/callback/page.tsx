'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus(`Authentication failed: ${error}`);
      const timer = setTimeout(() => router.push('/email'), 3000);
      return () => clearTimeout(timer);
    }

    if (code) {
      // Store the authorization code and exchange it for a token
      // This would typically be done on your backend
      try {
        // Simulate token exchange
        localStorage.setItem('gmailAuthCode', code);
        setStatus('Authentication successful! Redirecting...');

        // In production, you would:
        // 1. Send code to backend
        // 2. Exchange for access token
        // 3. Store token securely

        const timer = setTimeout(() => router.push('/email'), 2000);
        return () => clearTimeout(timer);
      } catch (err) {
        setStatus('Failed to process authentication');
        const timer = setTimeout(() => router.push('/email'), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
        <p style={{ color: 'var(--muted-foreground)' }}>{status}</p>
      </div>
    </div>
  );
}
