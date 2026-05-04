'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';

interface ActivityLog {
  id: string;
  user: { fullName: string };
  action: string;
  targetType: string;
  targetName?: string;
  additionalInfo?: string;
  createdAt: string;
}

const ActivityLogPage = () => {
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
    } catch (error) {
      console.error('Error fetching activity logs:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ADDED': return 'text-green-600 bg-green-50';
      case 'EDITED': return 'text-blue-600 bg-blue-50';
      case 'DELETED': return 'text-red-600 bg-red-50';
      case 'LOGGED_IN': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Activity Log
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Audit trail of all system activities
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
            />
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
          >
            <option value="all">All Actions</option>
            <option value="ADDED">Added</option>
            <option value="EDITED">Edited</option>
            <option value="DELETED">Deleted</option>
            <option value="LOGGED_IN">Logged In</option>
          </select>
        </div>

        {/* Logs Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/25">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {log.user?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getActionColor(log.action)
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--foreground)" }}>
                        {log.targetName || `${log.targetType} record`}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {log.additionalInfo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;