'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, User, Mail, GraduationCap, Calendar, Trash2, Edit3, X, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/Button';

interface Student {
  id: string;
  fullName: string;
  email?: string | null;
  partner: { id: string; organizationName: string };
  status: string;
  cohort?: string | null;
  earlyReleaseEligible: boolean;
  addedDate?: string;
}

interface Partner {
  id: string;
  organizationName: string;
}

const statusColors: Record<string, string> = {
  ACTIVE_MEMBER: 'bg-green-100 text-green-700',
  APPLICANT: 'bg-yellow-100 text-yellow-700',
  ALUMNI: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-gray-100 text-gray-700',
};

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    partnerId: '',
    status: 'PENDING',
    cohort: '',
    earlyReleaseEligible: false,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsData, partnersData] = await Promise.all([
        api.getStudents(),
        api.getPartners(),
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setPartners(Array.isArray(partnersData) ? partnersData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStudents([]);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerId || !user?.id) {
      alert('Please select a partner');
      return;
    }

    try {
      if (editingId) {
        await api.updateStudent(editingId, {
          fullName: formData.fullName,
          email: formData.email,
          status: formData.status,
          cohort: formData.cohort,
          earlyReleaseEligible: formData.earlyReleaseEligible,
        });
      } else {
        await api.createStudent({
          ...formData,
          addedById: user.id,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        fullName: '',
        email: '',
        partnerId: '',
        status: 'PENDING',
        cohort: '',
        earlyReleaseEligible: false,
      });
      await fetchData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      fullName: student.fullName,
      email: student.email || '',
      partnerId: student.partner.id,
      status: student.status,
      cohort: student.cohort || '',
      earlyReleaseEligible: student.earlyReleaseEligible,
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.deleteStudent(id);
      await fetchData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.partner.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students Directory</h1>
            <p className="mt-1 text-muted-foreground">Track and manage student participation across partners.</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({
                fullName: '',
                email: '',
                partnerId: '',
                status: 'PENDING',
                cohort: '',
                earlyReleaseEligible: false,
              });
              setShowForm(!showForm);
            }}
            className={showForm ? 'bg-slate-600 hover:bg-slate-700' : 'bg-cyan-500 hover:bg-cyan-600'}
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Student'}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Partner *</label>
                <select
                  required
                  value={formData.partnerId}
                  onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select a partner...</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.organizationName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPLICANT">Applicant</option>
                  <option value="ACTIVE_MEMBER">Active Member</option>
                  <option value="ALUMNI">Alumni</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cohort</label>
                <input
                  type="text"
                  placeholder="Class of 2025"
                  value={formData.cohort}
                  onChange={(e) => setFormData({...formData, cohort: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.earlyReleaseEligible}
                    onChange={(e) => setFormData({...formData, earlyReleaseEligible: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-foreground">Early Release Eligible</span>
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex gap-3">
                <Button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white flex-1"
                >
                  {editingId ? 'Update Student' : 'Add Student'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search students by name, email, or partner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold text-foreground mt-2">{students.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground">Active Members</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{students.filter(s => s.status === 'ACTIVE_MEMBER').length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground">Early Release Eligible</p>
            <p className="text-2xl font-bold text-cyan-600 mt-2">{students.filter(s => s.earlyReleaseEligible).length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{students.filter(s => s.status === 'PENDING').length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Partner</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Cohort</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Early Release</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{student.fullName}</p>
                            {student.email && <p className="text-xs text-muted-foreground">{student.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{student.partner.organizationName}</td>
                      <td className="px-6 py-4">
                        <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-semibold', statusColors[student.status] || statusColors.PENDING)}>
                          {student.status === 'ACTIVE_MEMBER' ? 'Active Member' : student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{student.cohort || '—'}</td>
                      <td className="px-6 py-4">
                        {student.earlyReleaseEligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-medium">
                            <span>✓</span> Yes
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
}

