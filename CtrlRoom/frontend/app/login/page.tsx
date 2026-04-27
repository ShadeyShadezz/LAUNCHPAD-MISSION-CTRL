'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('test@launchpad.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
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
        <div className="bg-card rounded-xl border border-border shadow-xl overflow-hidden">
          <div className="p-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-2 bg-primary/10">
                <Shield size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
                  Launchpad
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
                  Mission Control
                </p>
              </div>
              <p className="text-muted-foreground font-medium text-sm mt-4">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg text-sm font-semibold border bg-destructive/10 border-destructive text-destructive">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 rounded-lg text-xs space-y-2 border-l-4 bg-secondary border-primary">
              <p className="font-bold text-foreground">Demo Credentials:</p>
              <p className="text-muted-foreground">
                Email: <span className="font-mono font-bold">test@launchpad.com</span>
              </p>
              <p className="text-muted-foreground">
                Password: <span className="font-mono font-bold">password123</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="test@launchpad.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-semibold placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-semibold placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full relative overflow-hidden mt-2 px-6 py-4 rounded-lg font-bold text-white bg-primary shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} strokeWidth={3} />
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
        <p className="text-center text-xs mt-8 font-semibold text-muted-foreground">
          Secure authentication gateway. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
