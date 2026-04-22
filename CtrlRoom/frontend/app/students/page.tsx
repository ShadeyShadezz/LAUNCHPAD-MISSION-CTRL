'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from "lucide-react";
import Link from 'next/link';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Student>({
    id: '',
    fullName: '',
    email: null,
    partner: { organizationName: '', id: '' },
    status: '',
    cohort: null,
    earlyReleaseEligible: false,
    addedDate: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    partnerId: '',
    status: 'PENDING',
    cohort: '',
    earlyReleaseEligible: false,
    addedById: 'temp-staff-id',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/students');
      if (!res.ok) return;
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error('Fetch students error:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowForm(false);
      setFormData({
        fullName: '',
        email: '',
        partnerId: '',
        status: 'PENDING',
        cohort: '',
        earlyReleaseEligible: false,
        addedById: 'temp-staff-id',
      });
      fetchStudents();
    } catch (error) {
      alert('Error adding student');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditForm({ ...student });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/api/students/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      fetchStudents();
    } catch (error) {
      alert('Error updating student');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE',
      });
      fetchStudents();
    } catch (error) {
      alert('Error deleting student');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading students...</div>;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>Students Directory</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 focus:ring-4 focus:ring-[var(--primary)]/30 transition-all duration-200"
            style={{ background: "linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)" }}
          >
            <Plus size={20} />
            {showForm ? 'Cancel' : 'Add Student'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl p-8 border shadow-lg" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>Add New Student</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Full Name *</label>
                <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-3 border rounded-lg" style={{ borderColor: "var(--border)", backgroundColor: "var(--input)" }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Partner ID *</label>
                <input type="text" required value={formData.partnerId} onChange={(e) => setFormData({...formData, partnerId: e.target.value})} className="w-full p-3 border rounded-lg" style={{ borderColor: "var(--border)", backgroundColor: "var(--input)" }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 border rounded-lg" style={{ borderColor: "var(--border)", backgroundColor: "var(--input)" }}>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE_MEMBER">Active</option>
                  <option value="ALUMNI">Alumni</option>
                </select>
              </div>
              <div className="flex items-center">
                <input id="early-release" type="checkbox" checked={formData.earlyReleaseEligible} onChange={(e) => setFormData({...formData, earlyReleaseEligible: e.target.checked})} className="mr-2" />
                <label htmlFor="early-release" className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Early Release Eligible</label>
              </div>
              <button type="submit" className="md:col-span-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition md:justify-self-start" style={{ backgroundColor: "var(--primary)" }}>Add Student</button>
            </form>
          </div>
        )}

        {editingId && (
          <div className="bg-yellow-50 border-l-4 p-6 rounded-lg border-yellow-400" >
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>Edit Student</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} className="p-3 border rounded-lg" style={{ borderColor: "var(--border)", backgroundColor: "var(--input)" }} />
              <button onClick={handleUpdate} className="px-6 py-2 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 focus:ring-4 focus:ring-green-500/30 transition-all duration-200" style={{ background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)" }}>Update</button>
              <button onClick={() => setEditingId(null)} className="px-6 py-2 rounded-lg font-semibold" style={{ backgroundColor: "var(--muted)" }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl overflow-hidden shadow-lg border" style={{ borderColor: "var(--border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--secondary)" }}>
                <th className="p-4 text-left font-semibold" style={{ color: "var(--foreground)" }}>Name</th>
                <th className="p-4 text-left font-semibold" style={{ color: "var(--foreground)" }}>Email</th>
                <th className="p-4 text-left font-semibold" style={{ color: "var(--foreground)" }}>Partner</th>
                <th className="p-4 text-left font-semibold" style={{ color: "var(--foreground)" }}>Status</th>
                <th className="p-4 text-left font-semibold" style={{ color: "var(--foreground)" }}>Cohort</th>
                <th className="p-4 text-right font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
                    No students found. Add your first!
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-4 font-medium" style={{ color: "var(--foreground)" }}>{student.fullName}</td>
                    <td className="p-4" style={{ color: "var(--muted-foreground)" }}>{student.email || 'N/A'}</td>
                    <td className="p-4" style={{ color: "var(--foreground)" }}>{student.partner.organizationName}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                        backgroundColor: student.status === 'ACTIVE_MEMBER' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: student.status === 'ACTIVE_MEMBER' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {student.status.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4" style={{ color: "var(--muted-foreground)" }}>{student.cohort || 'N/A'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleEdit(student)} className="px-4 py-1 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: "var(--primary)" }}>Edit</button>
              <button onClick={() => handleDelete(student.id)} className="px-4 py-1 rounded-lg text-xs font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus:ring-4 focus:ring-red-500/30 transition-all duration-200 ml-2" style={{ background: "linear-gradient(135deg, var(--destructive) 0%, #dc2626 100%)" }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
