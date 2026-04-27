"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center max-w-md space-y-6">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-8">
          <ArrowLeft size={48} className="text-muted-foreground rotate-180" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">Unknown Mission Signal</h1>
          <p className="text-lg text-muted-foreground font-bold leading-relaxed">
            The requested tactical path does not exist in the current grid. 
            Redirecting to mission control.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

