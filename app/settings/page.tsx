'use client';

import { Moon, Sun, Users } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';

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

        <section className="ui-card lmc-settings-card">
          <div className="lmc-section-header">
            <div>
              <p className="lmc-section-eyebrow">Account identity</p>
              <h2 className="lmc-section-heading">Your Profile</h2>
            </div>
          </div>
          <div className="lmc-profile-grid">
            <div className="lmc-profile-field">
              <p className="lmc-profile-label">Full Name</p>
              <p className="lmc-profile-value">{user?.fullName || 'Not provided'}</p>
            </div>
            <div className="lmc-profile-field">
              <p className="lmc-profile-label">Role</p>
              <p className="lmc-profile-value">{user?.role || 'Staff'}</p>
            </div>
            <div className="lmc-profile-field lmc-profile-field--wide">
              <p className="lmc-profile-label">Email</p>
              <p className="lmc-profile-value">{user?.email || 'Not provided'}</p>
            </div>
            <div className="lmc-profile-field">
              <p className="lmc-profile-label">Access Level</p>
              <p className="lmc-profile-value text-success">Full access</p>
            </div>
          </div>
        </section>

        <section className="ui-card lmc-settings-card">
          <div className="lmc-settings-row">
            <div>
              <p className="lmc-section-eyebrow">Interface mode</p>
              <h2 className="lmc-section-heading">Appearance</h2>
              <p className="lmc-settings-description">Switch between bright workspace mode and focused dark mode.</p>
            </div>
            <Button
              onClick={toggleTheme}
              type="button"
              variant="secondary"
              size="md"
            >
              {theme === 'light' ? (
                <><Moon size={18} /> Dark Mode</>
              ) : (
                <><Sun size={18} /> Light Mode</>
              )}
            </Button>
          </div>
        </section>

        <section className="ui-card lmc-settings-card">
          <div className="lmc-settings-row">
            <div>
              <p className="lmc-section-eyebrow">Team controls</p>
              <h2 className="lmc-section-heading">Staff Members</h2>
              <p className="lmc-settings-description">Manage team access, roles, and workspace permissions.</p>
            </div>
            <Button
              onClick={() => router.push('/staff')}
              type="button"
              size="md"
            >
              <Users size={18} />
              Manage Staff
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
