'use client';

import { useState, useEffect } from 'react';
import { Plus, Mail, LogOut, ClipboardList, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    recentInteractions: [],
    pendingFollowups: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/staff/dashboard');
      if (!res.ok) {
        return;
      }
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userData = {
    fullName: 'Sarah Jenkins',
    role: 'Administrator',
  };

  // Mock stats for other fields as backend only provides recentInteractions and pendingFollowups for now
  const stats = {
    activeStudents: 48,
    earlyReleaseEligible: 12,
    addedThisMonth: 8,
    totalStudents: 156,
  };

  const interactionStats = {
    thisMonth: 24,
    studentReachable: 145,
    staffContributions: 6,
    pendingFollowUp: data.pendingFollowups,
  };

  const quickActions = [
    {
      icon: Plus,
      label: 'Add Partner Record',
      href: '/partners/new',
      description: 'Create a new partnership',
      color: 'var(--primary)',
    },
    {
      icon: Mail,
      label: 'Quick Email',
      href: '/email',
      description: 'Send outreach email',
      color: 'var(--accent)',
    },
    {
      icon: LogOut,
      label: 'Log Interaction',
      href: '/interactions/new',
      description: 'Record staff activity',
      color: 'var(--success)',
    },
    {
      icon: ClipboardList,
      label: 'Admin Review Queue',
      href: '/admin/review',
      description: 'Pending items (3)',
      color: 'var(--warning)',
    },
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Welcome back, {userData.fullName}
          </h1>
          <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
            Role: <span className="font-semibold" style={{ color: "var(--foreground)" }}>{userData.role}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group rounded-xl border-0 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] focus:ring-4 focus:ring-[var(--primary)]/20 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, var(--card) 0%, ${action.color}10 100%)`,
                    boxShadow: "0 4px 6px -1px rgba(0, 0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: `${action.color}20`,
                        color: action.color,
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                        {action.label}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Daily Reminder */}
        <div
          className="rounded-lg border-l-4 p-6"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--accent)",
            borderLeftWidth: '4px',
          }}
        >
          <div className="flex items-start gap-4">
            <AlertCircle style={{ color: "var(--accent)" }} size={24} className="flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>
                Daily Reminder
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                Check your email for partner replies, pending outreach, and follow-up requests before logging new activity.
              </p>
              <Link
                href="mailto:"
                className="inline-block px-4 py-2 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Check Email
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Students Stats */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <Users size={24} />
              Students
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Total Students
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                  {stats.totalStudents}
                </p>
              </div>
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Active Members
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                  {stats.activeStudents}
                </p>
              </div>
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Early Release Eligible
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--success)" }}>
                  {stats.earlyReleaseEligible}
                </p>
              </div>
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Added This Month
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
                  {stats.addedThisMonth}
                </p>
              </div>
            </div>
          </div>

          {/* Interactions Stats */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <TrendingUp size={24} />
              Interactions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  This Month
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                  {interactionStats.thisMonth}
                </p>
              </div>
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Student Reachable
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                  {interactionStats.studentReachable}
                </p>
              </div>
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Staff Contributions
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--success)" }}>
                  {interactionStats.staffContributions}
                </p>
              </div>
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Pending Follow-up
                </p>
                <p className="text-3xl font-bold" style={{ color: "var(--warning)" }}>
                  {interactionStats.pendingFollowUp}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
