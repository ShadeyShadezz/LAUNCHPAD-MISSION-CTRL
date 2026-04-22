'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div
            className="p-6 rounded-full"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <AlertTriangle size={48} style={{ color: "var(--destructive)" }} />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          404
        </h1>
        <p className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
          Page not found
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="javascript:history.back()"
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Go Back
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg font-semibold border transition-all"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
