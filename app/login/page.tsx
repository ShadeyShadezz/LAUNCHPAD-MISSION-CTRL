'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // The useEffect will handle the redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="lmc-surface overflow-hidden">
          <div className="p-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                <Shield size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Launchpad
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Mission Control
                </p>
              </div>
              <p className="text-muted-foreground text-sm mt-3">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg text-sm font-medium border bg-destructive/10 border-destructive text-destructive">
                {error}
              </div>
            )}



            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="test@launchpad.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="lmc-input pl-12 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lmc-input pl-12 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-10 px-4 rounded-lg font-semibold text-primary-foreground bg-primary shadow-sm hover:shadow hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-wide font-black">
              <div className="flex-1 h-px bg-border/50" />
              <span>Secure Channel</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs mt-10 font-semibold text-muted-foreground">
          Secure authentication gateway. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
