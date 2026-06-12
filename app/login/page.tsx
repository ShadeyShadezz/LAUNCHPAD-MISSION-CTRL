'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paramError = searchParams.get('error');
    if (paramError === 'server_config') {
      setError('Server auth configuration is missing. Set JWT_SECRET in Vercel environment variables.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="lmc-login-shell relative z-10 w-full max-w-[430px]">
        <div className="ui-card lmc-login-card overflow-hidden">
          <div className="lmc-login-inner px-6 py-8 sm:px-8 sm:py-9 ui-stack-lg">
            <div className="lmc-login-header text-center space-y-3">
              <div className="lmc-login-logo inline-flex items-center justify-center">
                <Image
                  src="/launchpad-logo.webp"
                  alt="Launchpad"
                  width={54}
                  height={54}
                  className="h-14 w-14 object-contain"
                  priority
                />
              </div>
              <div>
                <h2 className="lmc-login-title text-2xl font-bold text-foreground">
                  Staff Portal Login
                </h2>
              </div>
              <p className="lmc-login-subtitle text-muted-foreground text-sm mt-3">
                Sign in to access the partnership directory.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm font-medium border bg-destructive/10 border-destructive text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="lmc-login-form ui-stack-md">
              <div className="ui-field">
                <label htmlFor="login-email" className="ui-label">
                  Work Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="test@launchpad.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ui-input pl-12 pr-4"
                    required
                  />
                </div>
              </div>

              <div className="ui-field">
                <label htmlFor="login-password" className="ui-label">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ui-input pl-12 pr-4"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                fullWidth
                size="lg"
                className="mt-1"
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
              </Button>
            </form>

            <div className="lmc-login-divider flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-wide font-black">
              <div className="flex-1 h-px bg-border/50" />
              <span>or continue with</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          </div>
        </div>

        <p className="lmc-login-support text-center text-xs mt-6 font-semibold text-muted-foreground">
          Having trouble logging in? Contact IT Support
        </p>
      </div>
    </div>
  );
}
