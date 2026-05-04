'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Mail, ClipboardList, AlertCircle, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { useAuth } from '@/app/context/AuthContext';

type Interaction = {
  id: string;
  interactionType: string;
  date: string;
  sharedNotes?: string | null;
  partner?: { organizationName?: string | null } | null;
  staff?: { fullName?: string | null } | null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    recentInteractions: Interaction[];
    pendingFollowups: number;
  }>({
    recentInteractions: [],
    pendingFollowups: 0,
  });

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const result = await api.getDashboard();
      setData(result || { recentInteractions: [], pendingFollowups: 0 });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching dashboard:', error);
      setData({ recentInteractions: [], pendingFollowups: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);



  const stats = {
    activeStudents: 0,
    earlyReleaseEligible: 0,
    addedThisMonth: 0,
    totalStudents: 0,
  };

  const interactionStats = {
    thisMonth: 0,
    studentReachable: 0,
    staffContributions: 0,
    pendingFollowUp: data.pendingFollowups,
  };

  const quickActions = [
    { icon: Plus, label: 'Add Partner', href: '/partners', description: 'Create a new partnership', color: 'primary' },
    { icon: Mail, label: 'Email Terminal', href: '/email', description: 'Send outreach intelligence', color: 'accent' as const },
    { icon: ClipboardList, label: 'Log Activity', href: '/interactions', description: 'Record mission data', color: 'success' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Welcome */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-base text-muted-foreground leading-relaxed">
              Welcome back, <span className="font-medium text-foreground">{user?.fullName}</span>
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                {user?.role}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-card px-3 py-2 rounded border border-border">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </span>
            <span className="w-px h-3 bg-border" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-base font-semibold text-muted-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col p-4 bg-card border border-border rounded-lg transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-md flex items-center justify-center mb-3 transition-transform group-hover:scale-105',
                    action.color === 'primary' ? 'bg-primary/10 text-primary' :
                    action.color === 'accent' ? 'bg-accent/10 text-accent' :
                    action.color === 'success' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  )}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-medium text-sm text-foreground">{action.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{action.description}</p>
                  <div className="mt-auto pt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Go <ArrowRight size={12} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Daily Briefing */}
        <section className="bg-card border border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-2 rounded bg-accent/10 text-accent flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base">Daily Briefing</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Prioritize partner communication and verify student eligibility for early release missions.
            </p>
          </div>
          <Link
            href="mailto:"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
          >
            <Mail size={14} />
            Launch Outreach
          </Link>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Stats */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Users size={14} className="text-primary" />
              <h2 className="text-base font-semibold text-muted-foreground">Student Overview</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard label="Total Students" value={stats.totalStudents} color="primary" />
              <StatCard label="Active Members" value={stats.activeStudents} color="primary" />
              <StatCard label="Early Release Ready" value={stats.earlyReleaseEligible} color="success" />
              <StatCard label="Added This Month" value={stats.addedThisMonth} color="accent" />
            </div>
          </div>

          {/* Activity Stats */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={14} className="text-primary" />
              <h2 className="text-base font-semibold text-muted-foreground">Activity Metrics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard label="This Month" value={interactionStats.thisMonth} color="primary" />
              <StatCard label="Student Reachable" value={interactionStats.studentReachable} color="primary" />
              <StatCard label="Staff Contributions" value={interactionStats.staffContributions} color="success" />
              <StatCard label="Pending Follow-up" value={interactionStats.pendingFollowUp} color="warning" />
            </div>
          </div>
        </section>

        {/* Recent Interactions */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock size={14} className="text-primary" />
            <h2 className="text-base font-semibold text-muted-foreground">Recent Activity</h2>
          </div>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {loading ? (
              <div className="p-5 text-sm text-muted-foreground animate-pulse">Loading recent activity...</div>
            ) : data.recentInteractions.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No recent interactions found.</div>
            ) : (
              data.recentInteractions.map((interaction) => (
                <div key={interaction.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0">
                    <ClipboardList size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {interaction.interactionType}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {interaction.date ? new Date(interaction.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {interaction.partner?.organizationName ?? 'Unknown Partner'} • {interaction.staff?.fullName ?? 'Unknown Staff'}
                    </p>
                    {interaction.sharedNotes && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{interaction.sharedNotes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  color: 'primary' | 'success' | 'accent' | 'warning';
};

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    success: 'text-success',
    accent: 'text-accent',
    warning: 'text-warning',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 transition-all hover:shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={clsx('mt-2 text-3xl font-bold', colorClasses[color])}>{value}</p>
      <div className="mt-3 w-full h-1 bg-muted rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full', colorClasses[color].replace('text-', 'bg-'))} style={{ width: '60%' }} />
      </div>
    </div>
  );
}

