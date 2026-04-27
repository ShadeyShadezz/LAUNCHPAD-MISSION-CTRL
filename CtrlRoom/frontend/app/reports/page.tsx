'use client';

import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';

const ReportsPage = () => {
  const reportCards = [
    {
      title: 'Partner Engagement',
      metric: '24',
      subtitle: 'Interactions this month',
      icon: BarChart3,
      color: 'var(--primary)',
    },
    {
      title: 'Student Reach',
      metric: '145',
      subtitle: 'Students contacted',
      icon: Users,
      color: 'var(--success)',
    },
    {
      title: 'Team Activity',
      metric: '6',
      subtitle: 'Active staff members',
      icon: TrendingUp,
      color: 'var(--accent)',
    },
    {
      title: 'Timeline',
      metric: '30',
      subtitle: 'Days reporting period',
      icon: Calendar,
      color: 'var(--warning)',
    },
  ];

  const reportSections = [
    {
      name: 'Partnership Summary',
      description: 'Overview of all active partnerships and their status',
    },
    {
      name: 'Interaction Analytics',
      description: 'Breakdown of interactions by type, partner, and timeframe',
    },
    {
      name: 'Student Progress',
      description: 'Student enrollment, cohort progress, and demographics',
    },
    {
      name: 'Staff Performance',
      description: 'Activity logs and contribution metrics by staff member',
    },
    {
      name: 'Early Release Tracking',
      description: 'Monitor students eligible for early program release',
    },
    {
      name: 'Custom Reports',
      description: 'Build and export custom reports based on your criteria',
    },
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Reports
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Analytics and insights across your partnerships and student engagement
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold mb-1" style={{ color: card.color }}>
                      {card.metric}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {card.subtitle}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: `${card.color}20`,
                      color: card.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Available Reports */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Available Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportSections.map((report) => (
              <button
                key={report.name}
                className="rounded-lg border p-6 text-left transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <h3 className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  {report.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {report.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div
          className="rounded-lg border p-8"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Export Data
          </h3>
          <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Download your data in various formats for analysis and archiving.
          </p>
          <div className="flex gap-3 flex-wrap">
            {['CSV', 'Excel', 'PDF'].map((format) => (
              <button
                key={format}
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                Export as {format}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
