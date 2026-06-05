'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/app/lib/api';

interface ActivityLog {
  id: string;
  user: { fullName: string };
  action: string;
  targetType: string;
  targetName?: string;
  additionalInfo?: string;
  createdAt: string;
}

const AdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getActivityLogs();
      setActivityLogs(data);
    } catch (e) {
      console.error('Error fetching activity logs:', e);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch = log.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.additionalInfo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'ADDED': return 'lmc-badge lmc-badge--success';
      case 'EDITED': return 'lmc-badge lmc-badge--primary';
      case 'DELETED': return 'lmc-badge lmc-badge--destructive';
      case 'LOGGED IN': return 'lmc-badge lmc-badge--warning';
      default: return 'lmc-badge lmc-badge--primary';
    }
  };

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-7xl">
        {/* Header */}
        <div className="lmc-page-header">
          <span className="lmc-kicker">System Oversight</span>
          <div>
            <h1 className="lmc-page-title">Admin Controls</h1>
            <p className="lmc-page-subtitle">Monitor system activity and manage logs.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground lmc-surface px-4 py-2.5">
            <Calendar size={16} className="text-primary" />
            <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="lmc-panel p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by staff, target, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lmc-input pl-12 pr-4 py-3"
            />
          </div>
          <div className="md:col-span-5 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" size={16} />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="lmc-input w-full pl-12 pr-4 py-3"
            >
              <option value="all">All Actions</option>
              <option value="ADDED">Added</option>
              <option value="EDITED">Edited</option>
              <option value="DELETED">Deleted</option>
              <option value="LOGGED IN">Logged In</option>
            </select>
          </div>
          </div>
        </div>

        {/* Table */}
        <div className="lmc-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="lmc-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="spinner-ring-lg mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Loading activity logs...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {log.user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </div>
                          <span className="text-sm font-medium text-foreground">{log.user?.fullName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={getActionBadgeClass(log.action)}>{log.action}</span>
                      </td>
                      <td className="text-foreground font-medium">{log.targetName || log.targetType}</td>
                      <td className="text-muted-foreground">{log.additionalInfo || 'No details'}</td>
                      <td className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="lmc-empty-state-icon mx-auto mb-3">
                        <Search size={20} />
                      </div>
                      <p className="text-base font-semibold text-foreground mb-1">No matching logs</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">1–{filteredLogs.length}</span> of <span className="font-semibold text-foreground">{activityLogs.length}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="lmc-btn-inline gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30">
              <ChevronLeft size={16} /> Previous
            </button>
            <button type="button" className="lmc-btn-inline gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

