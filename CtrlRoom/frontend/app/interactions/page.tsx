'use client';

import { useState } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const InteractionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');

  const stats = [
    { label: 'Interactions This Month', value: 24 },
    { label: 'Student Reachable', value: 145 },
    { label: 'Staff Contributions', value: 6 },
    { label: 'Pending Follow-up', value: 5 },
  ];

  const interactions = [
    { id: '1', date: '2024-04-20', partner: 'TechBridge Academy', type: 'Infosession', staff: 'Sarah Jenkins', students: 25, notes: 'Great turnout' },
    { id: '2', date: '2024-04-18', partner: 'Youth Empowerment Center', type: 'Meeting', staff: 'James Brown', students: 0, notes: 'Partnership discussion' },
    { id: '3', date: '2024-04-15', partner: 'Lincoln High School', type: 'Tabling', staff: 'Sarah Jenkins', students: 18, notes: 'Student recruitment event' },
  ];

  const pendingFollowUps = [
    { id: '1', interaction: 'TechBridge Academy Infosession', dueDate: '2024-04-25', owner: 'Sarah Jenkins', notes: 'Send thank you email' },
    { id: '2', interaction: 'Lincoln High School Meeting', dueDate: '2024-04-23', owner: 'James Brown', notes: 'Follow-up discussion' },
  ];

  const filteredInteractions = interactions.filter((i) => {
    const matchesSearch = i.partner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || i.type.toLowerCase() === filterType;
    const matchesStaff = filterStaff === 'all' || i.staff === filterStaff;
    return matchesSearch && matchesType && matchesStaff;
  });

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>
              Interactions Log
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
              Track shared outreach activity
            </p>
          </div>
          <Link
            href="/interactions/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus size={20} />
            Log Interaction
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border p-6"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                {stat.label}
              </p>
              <p className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-3" size={20} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search by partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              style={{
                backgroundColor: "var(--input)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="all">All Types</option>
            <option value="infosession">Infosession</option>
            <option value="meeting">Meeting</option>
            <option value="tabling">Tabling</option>
            <option value="outreach">Outreach</option>
            <option value="interviews">Interviews</option>
          </select>
          <select
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            className="px-4 py-2 border rounded-lg font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="all">All Staff</option>
            <option value="Sarah Jenkins">Sarah Jenkins</option>
            <option value="James Brown">James Brown</option>
          </select>
        </div>

        {/* Recent Interactions */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Recent Interactions
          </h2>
          <div className="grid gap-4">
            {filteredInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Date
                    </p>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {new Date(interaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Partner
                    </p>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {interaction.partner}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Type
                    </p>
                    <p className="font-semibold" style={{ color: "var(--primary)" }}>
                      {interaction.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Staff
                    </p>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {interaction.staff}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Students
                    </p>
                    <p className="font-semibold" style={{ color: "var(--success)" }}>
                      {interaction.students}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <AlertCircle size={24} style={{ color: "var(--warning)" }} />
            Needs Follow-up
          </h2>
          <div className="grid gap-4">
            {pendingFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="rounded-lg border-l-4 p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--warning)",
                  borderLeftWidth: '4px',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                      {followUp.interaction}
                    </p>
                    <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                      {followUp.notes}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Assigned to: {followUp.owner}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--warning)" }}>
                      Due: {new Date(followUp.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionsPage;
