'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginPage from './login/page';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show login page if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading while checking auth
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
        <p style={{ color: 'var(--muted-foreground)' }}>Initializing Mission Control...</p>
      </div>
    </div>
  );
}
