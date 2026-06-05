'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import clsx from 'clsx';
import { AlertCircle, Mail, Users, TrendingUp, ClipboardList, Shield } from 'lucide-react';
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

type Stat = { label: string; value: number; icon: React.ReactNode; color: 'primary' | 'success' | 'accent' | 'warning' };

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
    return <div>Loading...</div>;
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
    { label: 'Active Partners', value: recentOrganizations.length, icon: <Shield size={16} />, color: 'primary' },
    { label: 'Total Partners', value: totalCount, icon: <Users size={16} />, color: 'success' },
    { label: 'Pending', value: pendingCount, icon: <ClipboardList size={16} />, color: 'accent' },
  ];

  const quickActionButtonClass =
    'lmc-quick-action-btn inline-flex w-fit items-center justify-center gap-2 rounded-md bg-[#047857] px-2.5 py-1.5 text-xs font-semibold uppercase leading-none transition-colors hover:bg-[#036b4f]';

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

        <section className="lmc-panel p-5 md:p-6">
          <div className="lmc-toolbar mb-4">
            <h3 className="text-base md:text-lg font-bold text-white">Quick Actions</h3>
            <button type="button" onClick={() => router.push('/interactions/new')} className={quickActionButtonClass}>
              <ClipboardList size={14} />
              Log New Interaction
            </button>
          </div>

          <div className="lmc-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  type="button"
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className={quickActionButtonClass}
                >
                  <Icon size={13} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="w-full grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6">
          <section className="lmc-panel p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
              <h4 className="text-sm md:text-base font-bold text-foreground">Recent Organizations</h4>
              <button type="button" onClick={() => router.push('/partners')} className={clsx(buttonVariants({ size: 'sm' }))}>View all</button>
            </div>

            {recentOrganizations.length === 0 ? (
              <p className="text-xs text-muted-foreground pt-4">No active partner records available.</p>
            ) : (
              <ul className="space-y-2 pt-4">
                {recentOrganizations.map((org) => (
                  <li key={org.id} className="flex items-center justify-between rounded-lg bg-muted/35 px-3 py-2.5 gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{org.name || 'No Organization Assigned'}</p>
                      <p className="text-xs text-muted-foreground">Tier: {org.tier || 'Tier Not Set'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/partnerships/${org.orgId || org.id}`)}
                      className={clsx(buttonVariants({ size: 'sm' }), 'whitespace-nowrap')}
                    >
                      Profile
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="lmc-panel p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                <AlertCircle size={18} />
              </div>
              <h3 className="text-base md:text-lg font-bold text-foreground">Daily Reminder</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
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
              <div className={clsx(
                'mx-auto p-2 rounded-lg w-fit',
                s.color === 'primary' ? 'text-primary bg-primary/10' :
                s.color === 'success' ? 'text-success bg-success/10' :
                s.color === 'accent' ? 'text-accent bg-accent/10' : 'text-warning bg-warning/10'
              )}>
                {s.icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">{s.label}</p>
              <p className={clsx('text-3xl font-bold leading-none', s.color === 'primary' ? 'text-primary' : s.color === 'success' ? 'text-success' : s.color === 'accent' ? 'text-accent' : 'text-warning')}>{s.value}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
