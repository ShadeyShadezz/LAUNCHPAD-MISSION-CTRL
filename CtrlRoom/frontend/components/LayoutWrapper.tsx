'use client';

import { useAuth } from '@/app/context/AuthContext';
import Sidebar from '@/components/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect unauthenticated users to login (except when already on login)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
          <p style={{ color: 'var(--muted-foreground)' }}>Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  // Show login without sidebar
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Show dashboard with sidebar for authenticated users
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--background)' }}>
        {children}
      </main>
    </div>
  );
}
