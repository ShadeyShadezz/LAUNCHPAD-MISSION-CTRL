'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import clsx from 'clsx';
import { AlertCircle, Mail, Users, TrendingUp, ClipboardList, Shield } from 'lucide-react';

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

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <main className="lmc-page-inner max-w-7xl">
        <div className="lmc-page-header">
          <div className="flex flex-row items-baseline gap-4 flex-wrap">
            <h1 className="lmc-page-title shrink-0">Mission Control Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of partner performance, actions, and outreach priorities.</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lmc-surface lmc-surface--interactive p-6">
            <h3 className="text-base md:text-lg font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col items-center p-3 bg-muted/40 rounded-lg border border-border/60 transition-all hover:bg-muted hover:shadow-sm"
                  >
                    <div className={clsx(
                      'w-6 h-6 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110',
                      action.color === 'primary' ? 'bg-primary/10 text-primary' :
                      action.color === 'accent' ? 'bg-accent/10 text-accent' :
                      action.color === 'success' ? 'bg-success/10 text-success' :
                      'bg-warning/10 text-warning'
                    )}>
                      <Icon size={14} />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground text-center">{action.label}</h4>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <h4 className="text-sm md:text-base font-bold text-foreground mb-3">Recent Organizations</h4>
              {recentOrganizations.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active partner records available.</p>
              ) : (
                <ul className="space-y-2">
                  {recentOrganizations.map((org) => (
                    <li key={org.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{org.name || 'No Organization Assigned'}</p>
                        <p className="text-xs text-muted-foreground">Tier: {org.tier || 'Tier Not Set'}</p>
                      </div>
                      <Link
                        href={`/partnerships/${org.orgId || org.id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Profile
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lmc-surface lmc-surface--interactive p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-base md:text-lg font-bold text-foreground">Daily Reminder</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Prioritize partner communication and review partnership statuses.
            </p>
            <Link
              href="/email"
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-primary/20"
            >
              <Mail size={16} />
              Check Email
            </Link>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="lmc-surface lmc-surface--interactive p-6 flex flex-col items-center justify-center text-center min-h-[130px]">
              <div className={clsx(
                'p-2 rounded-lg mb-3',
                s.color === 'primary' ? 'text-primary bg-primary/10' :
                s.color === 'success' ? 'text-success bg-success/10' :
                s.color === 'accent' ? 'text-accent bg-accent/10' : 'text-warning bg-warning/10'
              )}>
                {s.icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">{s.label}</p>
              <p className={clsx('text-3xl font-bold mt-1.5 leading-none', s.color === 'primary' ? 'text-primary' : s.color === 'success' ? 'text-success' : s.color === 'accent' ? 'text-accent' : 'text-warning')}>{s.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
