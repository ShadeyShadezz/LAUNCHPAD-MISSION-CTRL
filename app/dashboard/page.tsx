'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import clsx from 'clsx';
import { AlertCircle, ArrowRight, Building2, Mail, Users, TrendingUp, ClipboardList, Shield, Activity } from 'lucide-react';
import { buttonVariants } from '@/app/components/Button';

interface RecentOrganization {
  id: string;
  orgId: string | null;
  name: string;
  tier: string | null;
  status: string;
  statusNormalized?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'UNKNOWN';
  statusLabel?: string;
}

type Stat = { label: string; value: number; helper: string; icon: React.ReactNode; color: 'primary' | 'success' | 'accent' | 'warning' };

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [recentOrganizations, setRecentOrganizations] = useState<RecentOrganization[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/partners', {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          setRecentOrganizations([]);
          return;
        }

        const data = (await response.json()) as any[];
        const list = Array.isArray(data) ? data : [];
        const active = list
          .filter((org) => (org.partnerStatus || '').toUpperCase() === 'ACTIVE')
          .slice(0, 4)
          .map((org) => ({
            id: org.id,
            orgId: null,
            name: org.organizationName,
            tier: org.partnerType || null,
            status: org.partnerStatus || 'Unknown',
            statusNormalized: (org.partnerStatus || '').toUpperCase() as any,
          }));

        setRecentOrganizations(active);
        setTotalCount(list.length);
        setPendingCount(list.filter((org) => (org.partnerStatus || '').toUpperCase() === 'PENDING').length);
      } catch {
        setRecentOrganizations([]);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="lmc-page flex items-center justify-center">
        <div className="ui-card px-8 py-8 text-sm font-medium text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickActions = [
    { label: 'Log Interaction', description: 'Record interaction', icon: ClipboardList, href: '/interactions/new', color: 'accent' as const },
    { label: 'Manage Partners', description: 'Update partners', icon: Users, href: '/partners', color: 'success' as const },
    { label: 'Add Partner Record', description: 'Create a partnership record', icon: TrendingUp, href: '/partners/new', color: 'success' as const },
    { label: 'Send Email', description: 'Launch outreach', icon: Mail, href: '/email', color: 'warning' as const },
    { label: 'Partnerships', description: 'View partnered organizations', icon: Shield, href: '/partnerships', color: 'primary' as const },
  ];

  const stats: Stat[] = [
    { label: 'Active Partners', value: recentOrganizations.length, helper: 'Ready for outreach and relationship planning', icon: <Shield size={18} />, color: 'primary' },
    { label: 'Total Partners', value: totalCount, helper: 'Organizations currently tracked in the workspace', icon: <Users size={18} />, color: 'success' },
    { label: 'Pending Review', value: pendingCount, helper: 'Records that need status confirmation', icon: <ClipboardList size={18} />, color: 'accent' },
  ];

  const latestOrganizationName = recentOrganizations[0]?.name;

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <main className="lmc-page-inner max-w-7xl">
        <div className="lmc-page-header gap-3">
          <span className="lmc-kicker">Partner Operations</span>
          <div>
            <h1 className="lmc-page-title">Mission Control Dashboard</h1>
            <p className="lmc-page-subtitle">Overview of partner performance, actions, and outreach priorities.</p>
          </div>
        </div>

        <section className="ui-card p-5 md:p-6">
          <div className="lmc-toolbar lmc-dashboard-actions-header mb-4">
            <div>
              <p className="lmc-section-eyebrow">Workspace shortcuts</p>
              <h3 className="text-base md:text-lg font-semibold text-foreground">Quick Actions</h3>
            </div>
            <div className="lmc-dashboard-prompt">
              <Activity size={15} />
              <span>
                {latestOrganizationName
                  ? `Recent focus: check whether ${latestOrganizationName} needs a follow-up before the next outreach cycle.`
                  : 'Start with a partner check-in, then log what changed so the workspace stays current.'}
              </span>
            </div>
          </div>

          <div className="lmc-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  type="button"
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="lmc-action-tile w-full"
                >
                  <span className="lmc-action-icon">
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate text-sm font-semibold text-foreground">{action.label}</span>
                    <span className="block text-xs text-muted-foreground">{action.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="w-full grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6">
          <section className="ui-card lmc-section-card">
            <div className="lmc-section-header">
              <div>
                <p className="lmc-section-eyebrow">Live directory</p>
                <h4 className="lmc-section-heading">Recent Organizations</h4>
              </div>
              <button type="button" onClick={() => router.push('/partners')} className={clsx(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
                View all
                <ArrowRight size={14} />
              </button>
            </div>

            {recentOrganizations.length === 0 ? (
              <div className="lmc-empty-message">No active partner records available.</div>
            ) : (
              <ul className="lmc-organization-list">
                {recentOrganizations.map((org) => (
                  <li key={org.id} className="lmc-organization-row">
                    <div className="lmc-organization-mark" aria-hidden="true">
                      <Building2 size={16} />
                    </div>
                    <div className="lmc-organization-copy">
                      <p className="lmc-organization-name">{org.name || 'No Organization Assigned'}</p>
                      <div className="lmc-organization-meta">
                        <span>{org.tier || 'Tier not set'}</span>
                        <span className="lmc-meta-dot" />
                        <span>{org.status || 'Status unknown'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/partnerships/${org.orgId || org.id}`)}
                      className="lmc-row-action"
                    >
                      Profile
                      <ArrowRight size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ui-card lmc-section-card lmc-reminder-card">
            <div className="lmc-reminder-header">
              <div className="lmc-reminder-icon">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="lmc-section-eyebrow">Priority prompt</p>
                <h3 className="lmc-section-heading">Daily Reminder</h3>
              </div>
            </div>
            <p className="lmc-reminder-copy">
              Prioritize partner communication and review partnership statuses before end-of-day updates.
            </p>
            <button type="button" onClick={() => router.push('/email')} className={clsx(buttonVariants({ size: 'md' }))}>
              <Mail size={15} />
              Check Email
            </button>
          </section>
        </div>

        <section className="lmc-stat-grid">
          {stats.map((s) => (
            <article key={s.label} className="lmc-stat-card">
              <div className="lmc-stat-card-top">
                <div className={clsx(
                  'lmc-stat-card-icon',
                  s.color === 'primary' ? 'text-primary bg-primary/10' :
                  s.color === 'success' ? 'text-success bg-success/10' :
                  s.color === 'accent' ? 'text-accent bg-accent/10' : 'text-warning bg-warning/10'
                )}>
                  {s.icon}
                </div>
                <p className={clsx('lmc-stat-card-value', s.color === 'primary' ? 'text-primary' : s.color === 'success' ? 'text-success' : s.color === 'accent' ? 'text-accent' : 'text-warning')}>{s.value}</p>
              </div>
              <div>
                <p className="lmc-stat-card-label">{s.label}</p>
                <p className="lmc-stat-card-helper">{s.helper}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
