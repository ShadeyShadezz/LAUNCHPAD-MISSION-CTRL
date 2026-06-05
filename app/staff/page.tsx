'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { UserPlus, Mail, Shield, Loader2, Trash2 } from 'lucide-react';

type StaffMember = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

const ROLE_OPTIONS = [
  { value: 'STAFF_USER', label: 'Staff User' },
  { value: 'PROGRAM_COORDINATOR', label: 'Program Coordinator' },
  { value: 'PARTNERSHIP_MANAGER', label: 'Partnership Manager' },
  { value: 'ADMINISTRATOR', label: 'Administrator' },
];

export default function StaffPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STAFF_USER');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) router.push('/login');
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMINISTRATOR') {
      setError('Access restricted to administrators');
      setLoading(false);
      return;
    }
    fetchStaff();
  }, [user]);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/staff', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load staff');
      setStaff(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setSuccess(null);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ fullName, email, password, role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Create failed' }));
        throw new Error(err.error || 'Create failed');
      }
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('STAFF_USER');
      setSuccess('Staff member created successfully');
      fetchStaff();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create staff member');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    setDeletingId(id);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Delete failed');
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Failed to delete staff member');
    } finally {
      setDeletingId(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="spinner-ring-lg" />
      </div>
    );
  }
  if (!user) return null;

  if (user.role !== 'ADMINISTRATOR') {
    return (
      <div className="h-full flex items-center justify-center px-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">This page is available to administrators only.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-5xl">
        <div className="lmc-page-header">
          <span className="lmc-kicker">Personnel Management</span>
          <div>
            <h1 className="lmc-page-title">Staff Members</h1>
            <p className="lmc-page-subtitle">Create and manage staff accounts.</p>
          </div>
        </div>

        {error && (
          <div className="lmc-banner lmc-banner--error flex items-center justify-between">
            <span>{error}</span>
            <button className="underline text-sm" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Create Staff Form */}
        <section className="lmc-surface p-6 md:p-8">
          <h2 className="text-base md:text-lg font-bold text-foreground mb-5 flex items-center gap-3">
            <UserPlus size={20} className="text-primary" />
            Create New Staff Member
          </h2>

          {createError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
              {createError}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="staff-name">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="staff-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="staff-email">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="staff-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="staff-password">
                Password <span className="text-destructive">*</span>
              </label>
              <input
                id="staff-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Min 8 characters"
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="staff-role">
                Role <span className="text-destructive">*</span>
              </label>
              <select
                id="staff-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={creating}
                className="lmc-btn-inline gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating...</>
                ) : (
                  <><UserPlus size={16} /> Create Staff</>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Staff List */}
        <section className="lmc-surface overflow-hidden">
          <div className="px-6 pt-6">
            <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-3">
              <Shield size={20} className="text-primary" />
              Current Staff ({loading ? '...' : staff.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="lmc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                      Loading staff records...
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No staff members found. Create one above.
                    </td>
                  </tr>
                ) : staff.map((member) => (
                  <tr key={member.id}>
                    <td className="font-semibold text-foreground">{member.fullName}</td>
                    <td className="text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Mail size={14} className="text-muted-foreground/50" />
                        {member.email}
                      </span>
                    </td>
                    <td>
                      <span className="lmc-badge lmc-badge--primary">{member.role}</span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(member.id)}
                        type="button"
                        disabled={deletingId === member.id || member.id === user.id}
                        aria-label={`Delete ${member.fullName}`}
                        className="lmc-btn-inline h-9 w-9 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                      >
                        {deletingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
