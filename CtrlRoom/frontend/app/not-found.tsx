"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 mx-auto rounded-lg bg-muted/50 flex items-center justify-center mb-4">
          <ArrowLeft size={40} className="text-muted-foreground rotate-180" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist. Let's get you back to the dashboard.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg shadow-sm hover:shadow hover:bg-primary/90 transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

