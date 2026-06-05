'use client';

import React from 'react';
const { useState, useEffect } = React;
import { Search } from 'lucide-react';
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

const ActivityLogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterTargetType, setFilterTargetType] = useState('all');
  const [filterStaffId, setFilterStaffId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<{ id: string; fullName: string }[]>([]);

  useEffect(() => {
    fetchActivityLogs();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/staff', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) setStaffList(await res.json());
    } catch {
      // Non-critical
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getActivityLogs({
        action: filterAction,
        targetType: filterTargetType,
        staffId: filterStaffId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setActivityLogs(data);
    } catch (error) {
      setActivityLogs([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Activity tracking temporarily offline'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchActivityLogs();
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch = searchQuery === '' || (
      log.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.additionalInfo?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'ADDED':
      case 'CREATED': return 'lmc-badge lmc-badge--success';
      case 'EDITED': return 'lmc-badge lmc-badge--primary';
      case 'DELETED': return 'lmc-badge lmc-badge--destructive';
      case 'LOGGED_IN': return 'lmc-badge lmc-badge--warning';
      default: return 'lmc-badge lmc-badge--primary';
    }
  };

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-7xl">
        <div className="lmc-page-header">
          <span className="lmc-kicker">Audit Trail</span>
          <div>
            <h1 className="lmc-page-title">Activity Log</h1>
            <p className="lmc-page-subtitle">Audit trail of all system activities</p>
          </div>
        </div>

        {/* Filters */}
        <div className="lmc-panel p-4 md:p-5">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lmc-input pl-10 pr-4 py-3"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="lmc-input px-4 py-3 w-auto min-w-[140px]"
          >
            <option value="all">All Actions</option>
            <option value="CREATED">Created</option>
            <option value="EDITED">Edited</option>
            <option value="DELETED">Deleted</option>
            <option value="LOGGED_IN">Logged In</option>
          </select>
          <select
            value={filterTargetType}
            onChange={(e) => setFilterTargetType(e.target.value)}
            className="lmc-input px-4 py-3 w-auto min-w-[140px]"
          >
            <option value="all">All Targets</option>
            <option value="Partner">Partner</option>
            <option value="Interaction">Interaction</option>
            <option value="Staff">Staff</option>
            <option value="StaffNote">Staff Note</option>
            <option value="Email">Email</option>
          </select>
          <select
            value={filterStaffId}
            onChange={(e) => setFilterStaffId(e.target.value)}
            className="lmc-input px-4 py-3 w-auto min-w-[160px]"
          >
            <option value="">All Staff</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="lmc-input px-4 py-3 w-auto"
            title="Start date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="lmc-input px-4 py-3 w-auto"
            title="End date"
          />
          <button
            type="button"
            onClick={handleFilter}
            className="lmc-btn-inline px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Apply Filters
          </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="lmc-surface overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="spinner-ring-lg mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading activity logs...</p>
            </div>
          ) : errorMessage ? (
            <div className="py-16 text-center">
              <p className="text-sm text-destructive font-medium">{errorMessage || 'Activity tracking temporarily offline'}</p>
              <button
                onClick={fetchActivityLogs}
                className="lmc-btn-inline mt-3 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Retry
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="lmc-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="font-medium text-foreground">{log.user?.fullName}</td>
                      <td>
                        <span className={getActionBadgeClass(log.action)}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-foreground">{log.targetName || `${log.targetType} record`}</td>
                      <td className="text-muted-foreground">{log.additionalInfo || '-'}</td>
                      <td className="text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt)}</td>
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