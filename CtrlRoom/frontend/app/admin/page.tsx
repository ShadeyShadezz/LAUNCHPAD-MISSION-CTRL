'use client';

import { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('7days');

  const activityLogs = [
    { id: '1', staff: 'Sarah Jenkins', action: 'EDITED', target: 'TechBridge Academy', info: 'Updated contact information', timestamp: '2024-04-20 14:32:15' },
    { id: '2', staff: 'James Brown', action: 'ADDED', target: 'Maria Garcia', info: 'Added new student', timestamp: '2024-04-20 10:15:42' },
    { id: '3', staff: 'Sarah Jenkins', action: 'LOGGED IN', target: 'System', info: 'Staff login', timestamp: '2024-04-20 08:45:00' },
    { id: '4', staff: 'Maria Garcia', action: 'ADDED', target: 'Youth Center Infosession', info: 'Logged interaction', timestamp: '2024-04-19 16:20:33' },
    { id: '5', staff: 'David Chen', action: 'DELETED', target: 'Pending Partner', info: 'Removed inactive partner', timestamp: '2024-04-19 13:10:22' },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch = log.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.info.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ADDED':
        return 'var(--success)';
      case 'EDITED':
        return 'var(--primary)';
      case 'DELETED':
        return 'var(--destructive)';
      case 'LOGGED IN':
        return 'var(--accent)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  const getActionBg = (action: string) => {
    const color = getActionColor(action);
    if (color === 'var(--success)') return 'rgba(16, 185, 129, 0.1)';
    if (color === 'var(--primary)') return 'rgba(14, 165, 164, 0.1)';
    if (color === 'var(--destructive)') return 'rgba(239, 68, 68, 0.1)';
    if (color === 'var(--accent)') return 'rgba(249, 115, 22, 0.1)';
    return 'rgba(156, 163, 175, 0.1)';
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Admin Controls
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Activity log and system administration
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-3" size={20} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search by staff, target, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--input)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border rounded-lg font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="all">All Actions</option>
            <option value="ADDED">Added</option>
            <option value="EDITED">Edited</option>
            <option value="DELETED">Deleted</option>
            <option value="LOGGED IN">Logged In</option>
          </select>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Activity Log Table */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--secondary)", borderBottom: `1px solid var(--border)` }}>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Staff
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Action
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Target / Record
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: `1px solid var(--border)`,
                      backgroundColor: "var(--card)",
                    }}
                    className="hover:opacity-75 transition-all"
                  >
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {log.staff}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: getActionBg(log.action),
                          color: getActionColor(log.action),
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: "var(--primary)" }}>
                      {log.target}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {log.info}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {log.timestamp}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center" style={{ color: "var(--muted-foreground)" }}>
                    No activity found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--muted-foreground)" }}>
          <p>Showing 1 to 5 of {activityLogs.length} entries</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border transition-all"
              style={{
                backgroundColor: "var(--secondary)",
                borderColor: "var(--border)",
                color: "var(--secondary-foreground)",
              }}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded border transition-all"
              style={{
                backgroundColor: "var(--secondary)",
                borderColor: "var(--border)",
                color: "var(--secondary-foreground)",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
