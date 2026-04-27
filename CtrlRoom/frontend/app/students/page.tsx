'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, User, Mail, GraduationCap, Calendar, Trash2, Edit3, X, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

interface Student {
  id: string;
  fullName: string;
  email?: string | null;
  partner: { id: string; organizationName: string };
  status: string;
  cohort?: string | null;
  earlyReleaseEligible: boolean;
  addedDate: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', partnerId: '',
    status: 'PENDING', cohort: '', earlyReleaseEligible: false, addedById: 'temp-staff-id',
  });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/students');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/students', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowForm(false);
      setFormData({ fullName: '', email: '', partnerId: '', status: 'PENDING', cohort: '', earlyReleaseEligible: false, addedById: 'temp-staff-id' });
      fetchStudents();
    } catch { alert('Error adding student'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await fetch(`http://localhost:5000/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch { alert('Error deleting student'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students Directory</h1>
            <p className="mt-2 text-muted-foreground">Monitor and manage student mission progress.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={clsx(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors',
              showForm ? 'bg-muted text-foreground' : 'bg-primary text-white hover:bg-primary/90'
            )}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'Add Student'}
          </button>
        </section>

        {showForm && (
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-md bg-primary/10 text-primary"><GraduationCap size={20} /></div>
              <h2 className="text-lg font-semibold text-foreground">New Student Entry</h2>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name *</label>
                <input type="text" required placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Partner ID *</label>
                <input type="text" required placeholder="org-id-..." value={formData.partnerId} onChange={(e) => setFormData({...formData, partnerId: e.target.value})} className="w-full p-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Cohort</label>
                <input type="text" placeholder="Spring 2024" value={formData.cohort} onChange={(e) => setFormData({...formData, cohort: e.target.value})} className="w-full p-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-input border border-border rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE_MEMBER">Active Member</option>
                  <option value="ALUMNI">Alumni</option>
                </select>
              </div>
              <div className="flex items-center gap-3 lg:pt-7">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.earlyReleaseEligible} onChange={(e) => setFormData({...formData, earlyReleaseEligible: e.target.checked})} />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success" />
                </label>
                <span className="text-sm text-foreground">Early Release Ready</span>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-5 py-2.5 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors">Add Student</button>
              </div>
            </form>
          </section>
        )}

        <section className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground">Student</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground">Partner</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground">Cohort</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <User size={28} className="text-muted-foreground" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">No Students Found</p>
                        <p className="text-sm text-muted-foreground">Add your first student to get started.</p>
                        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors">Add First Student</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {student.fullName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground">{student.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border', student.status === 'ACTIVE_MEMBER' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20')}>
                          {student.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{student.partner.organizationName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{student.cohort || 'TBD'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-md text-primary bg-primary/5 hover:bg-primary hover:text-white transition-colors" title="Edit"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(student.id)} className="p-2 rounded-md text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

