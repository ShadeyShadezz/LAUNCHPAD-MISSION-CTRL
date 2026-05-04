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
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* Welcome */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Dashboard</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Welcome back, <span className="font-medium text-foreground text-lg">{user?.fullName}</span>
              <span className="ml-4 inline-flex items-center px-3 py-2 rounded text-xs font-medium bg-primary/10 text-primary">
                {user?.role}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground bg-card px-5 py-3 rounded border border-border whitespace-nowrap">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </span>
            <span className="w-px h-4 bg-border" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col p-8 bg-card border border-border rounded-lg transition-all hover:shadow-lg hover:border-primary/50"
                >
                  <div className={clsx(
                    'w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-transform group-hover:scale-110',
                    action.color === 'primary' ? 'bg-primary/10 text-primary' :
                    action.color === 'accent' ? 'bg-accent/10 text-accent' :
                    action.color === 'success' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  )}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-base text-foreground mb-2">{action.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{action.description}</p>
                  <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Go <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Daily Briefing */}
        <section className="bg-card border border-border rounded-lg p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-3 rounded-lg bg-accent/10 text-accent flex-shrink-0">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-2">Daily Briefing</h3>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Prioritize partner communication and verify student eligibility for early release missions.
            </p>
          </div>
          <Link
            href="mailto:"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            <Mail size={16} />
            Launch Outreach
          </Link>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Student Stats */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Users size={18} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Student Overview</h2>
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
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp size={18} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Activity Metrics</h2>
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
          <div className="flex items-center gap-3 mb-8">
            <Clock size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
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

