'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const activityLogs = [
    { id: '1', staff: 'Sarah Jenkins', action: 'EDITED', target: 'TechBridge Academy', info: 'Updated contact information', timestamp: '2024-04-20 14:32' },
    { id: '2', staff: 'James Brown', action: 'ADDED', target: 'Maria Garcia', info: 'Added new student', timestamp: '2024-04-20 10:15' },
    { id: '3', staff: 'Sarah Jenkins', action: 'LOGGED IN', target: 'System', info: 'Staff login', timestamp: '2024-04-20 08:45' },
    { id: '4', staff: 'Maria Garcia', action: 'ADDED', target: 'Youth Center Infosession', info: 'Logged interaction', timestamp: '2024-04-19 16:20' },
    { id: '5', staff: 'David Chen', action: 'DELETED', target: 'Pending Partner', info: 'Removed inactive partner', timestamp: '2024-04-19 13:10' },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch = log.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.info.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionStyles = (action: string) => {
    switch (action) {
      case 'ADDED': return 'bg-success/10 text-success border-success/20';
      case 'EDITED': return 'bg-primary/10 text-primary border-primary/20';
      case 'DELETED': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'LOGGED IN': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Controls</h1>
            <p className="mt-1 text-sm text-muted-foreground">Monitor system activity and manage logs.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded border border-border">
            <Calendar size={14} className="text-primary" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </section>

        {/* Filters */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by staff, target, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="md:col-span-5 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-lg text-sm font-medium text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Actions</option>
              <option value="ADDED">Added</option>
              <option value="EDITED">Edited</option>
              <option value="DELETED">Deleted</option>
              <option value="LOGGED IN">Logged In</option>
            </select>
          </div>
        </section>

        {/* Table */}
        <section className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Staff</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Action</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Target</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Details</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {log.staff.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-foreground">{log.staff}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-1 rounded text-xs font-medium border', getActionStyles(log.action))}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{log.target}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{log.info}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{log.timestamp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Search size={20} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">No matching logs</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pagination */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredLogs.length}</span> of <span className="font-medium text-foreground">{activityLogs.length}</span> logs
          </p>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
              <ChevronLeft size={14} /> Previous
            </button>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;

