'use client';

import { Edit2, Trash2, UserPlus, Moon, Sun, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/app/context/AuthContext';

type StaffDirectoryRow = {
  id: string;
  name: string;
  role: string;
  title: string;
};

type StaffFormData = {
  fullName: string;
  email: string;
  role: string;
  title: string;
  password: string;
};

const emptyForm = (): StaffFormData => ({
  fullName: '',
  email: '',
  role: 'STAFF_USER',
  title: '',
  password: '',
});

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, getToken } = useAuth();
  const [staffList, setStaffList] = useState<StaffDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(emptyForm());
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setStaffError(null);
    try {
      const data = await api.getStaff();
      const mapped: StaffDirectoryRow[] = (Array.isArray(data) ? data : []).map((s: any) => ({
        id: s.id,
        name: s.fullName || 'Unknown',
        role: s.role || 'STAFF_USER',
        title: s.title || 'Not specified',
      }));
      setStaffList(mapped);
    } catch (error) {
      setStaffList([]);
      setStaffError(error instanceof Error ? error.message : 'Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData(emptyForm());
    setFormError('');
    setFormLoading(false);
    setShowAddModal(true);
  };

  const openEditModal = (staff: StaffDirectoryRow) => {
    setFormData({
      fullName: staff.name,
      email: '',
      role: staff.role,
      title: staff.title === 'Not specified' ? '' : staff.title,
      password: '',
    });
    setEditingId(staff.id);
    setFormError('');
    setFormLoading(false);
  };

  const closeFormModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    const token = getToken();
    try {
      if (editingId) {
        const res = await fetch(`/api/staff/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ fullName: formData.fullName, role: formData.role, title: formData.title }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Update failed' }));
          throw new Error(err.error || 'Update failed');
        }
      } else {
        const res = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Create failed' }));
          throw new Error(err.error || 'Create failed');
        }
      }
      closeFormModal();
      fetchStaff();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    setDeletingId(id);
    try {
      const token = getToken();
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(err.error || 'Delete failed');
      }
      setStaffList((prev) => prev.filter((staff) => staff.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete staff member');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-5xl">
        <div className="lmc-page-header">
          <div>
            <h1 className="lmc-page-title">Settings</h1>
            <p className="lmc-page-subtitle">Manage your workspace and staff</p>
          </div>
        </div>

        <section className="lmc-surface p-6 space-y-6">
          <h2 className="text-base md:text-lg font-bold text-foreground">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="text-lg font-semibold text-foreground">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Title / Role</p>
              <p className="text-lg font-semibold text-foreground">{user?.role} {user?.title && `- ${user.title}`}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="text-lg font-semibold text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Access Level</p>
              <p className="text-lg font-semibold text-success">Full access</p>
            </div>
          </div>
        </section>

        <section className="lmc-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose your preferred theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              {theme === 'light' ? (
                <><Moon size={18} /> Dark Mode</>
              ) : (
                <><Sun size={18} /> Light Mode</>
              )}
            </button>
          </div>
        </section>

        <section className="lmc-surface overflow-hidden">
          <div className="lmc-section-header px-6 pt-6">
            <h2 className="text-base md:text-lg font-bold text-foreground">Staff Directory</h2>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <UserPlus size={18} />
              Add Staff Member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="lmc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Title</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                      Loading database records...
                    </td>
                  </tr>
                ) : staffError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-destructive">
                      {staffError}
                      <button onClick={fetchStaff} className="ml-2 underline font-semibold">Retry</button>
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">No staff records found</td>
                  </tr>
                ) : staffList.map((staff) => (
                  <tr key={staff.id}>
                    <td className="font-semibold text-foreground">{staff.name}</td>
                    <td>
                      <span className="lmc-badge lmc-badge--primary">{staff.role}</span>
                    </td>
                    <td className="text-muted-foreground">{staff.title}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          disabled={deletingId === staff.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                        >
                          {deletingId === staff.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {(showAddModal || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={closeFormModal}>
          <div className="lmc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lmc-modal-header">
              <h3 className="text-lg font-semibold text-foreground">
                {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
              </h3>
              <button onClick={closeFormModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="lmc-modal-body space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <input
                  type="text" required
                  value={formData.fullName}
                  onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  className="lmc-input text-sm"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="lmc-input text-sm"
                  />
                </div>
              )}
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
                  <input
                    type="password" required
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="lmc-input text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                  className="lmc-input text-sm"
                >
                  <option value="STAFF_USER">Staff User</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="lmc-input text-sm"
                  placeholder="e.g., Program Coordinator"
                />
              </div>
            </form>
            <div className="lmc-modal-footer">
              <button
                type="button"
                onClick={closeFormModal}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                onClick={handleFormSubmit}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formLoading && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
