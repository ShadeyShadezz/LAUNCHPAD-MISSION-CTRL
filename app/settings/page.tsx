'use client';

import { Moon, Sun, Users } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-5xl">
        <div className="lmc-page-header">
          <span className="lmc-kicker">Workspace Controls</span>
          <div>
            <h1 className="lmc-page-title">Settings</h1>
            <p className="lmc-page-subtitle">Manage your workspace and staff</p>
          </div>
        </div>

        <section className="lmc-surface p-6 space-y-6">
          <h2 className="text-base md:text-lg font-bold text-foreground">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="text-lg font-semibold text-foreground">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Role</p>
              <p className="text-lg font-semibold text-foreground">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="text-lg font-semibold text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Access Level</p>
              <p className="text-lg font-semibold text-success">Full access</p>
            </div>
          </div>
        </section>

        <section className="lmc-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose your preferred theme</p>
            </div>
            <button
              onClick={toggleTheme}
              type="button"
              className="lmc-btn-inline gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary text-foreground text-sm font-medium hover:bg-muted"
            >
              {theme === 'light' ? (
                <><Moon size={18} /> Dark Mode</>
              ) : (
                <><Sun size={18} /> Light Mode</>
              )}
            </button>
          </div>
        </section>

        <section className="lmc-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground">Staff Members</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage staff accounts and permissions</p>
            </div>
            <button
              onClick={() => router.push('/staff')}
              type="button"
              className="lmc-btn-inline gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              <Users size={18} />
              Manage Staff
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
