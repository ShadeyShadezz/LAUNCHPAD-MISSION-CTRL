"use client";

import { useState, useEffect } from 'react';

interface Student {
  id: string;
  fullName: string;
  email: string | null;
  partner: { 
    organizationName: string; 
    id: string 
  };
  status: string;
  cohort: string | null;
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
      await fetch(`http://localhost:5000/api/students`, {
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

  if (loading) return <div className="container mx-auto py-10 px-4 text-center">Loading students...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
        >
          {showForm ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Add New Student</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Partner ID
              </label>
              <input
                type="text"
                placeholder="partner-uuid-from-partners-page"
                value={formData.partnerId}
                onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE_MEMBER">Active Member</option>
                <option value="ALUMNI">Alumni</option>
                <option value="APPLICANT">Applicant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cohort
              </label>
              <input
                type="text"
                placeholder="Class of 2025"
                value={formData.cohort}
                onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="lg:col-span-2 flex items-center">
              <input
                id="early-release"
                type="checkbox"
                checked={formData.earlyReleaseEligible}
                onChange={(e) => setFormData({ ...formData, earlyReleaseEligible: e.target.checked })}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="early-release" className="ml-3 block text-sm font-semibold text-gray-700">
                Early Release Eligible
              </label>
            </div>
            <button 
              type="submit" 
              className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Add Student
            </button>
          </form>
        </div>
      )}

      {editingId && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Student</h2>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button 
              type="submit" 
              className="lg:col-span-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg mr-4 transition-all"
            >
              Update Student
            </button>
            <button 
              type="button" 
              onClick={() => setEditingId(null)}
              className="lg:col-span-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Partner</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cohort</th>
              <th className="px-8 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                  No students yet. Add one above.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5 text-sm font-semibold text-gray-900">
                    {student.fullName}
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-600">
                    {student.email || 'No email'}
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-900">
                    {student.partner.organizationName}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                      student.status === 'active_member' 
                        ? 'bg-green-100 text-green-800' 
                        : student.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-600">
                    {student.cohort || 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-right text-sm space-x-3">
                    <button 
                      onClick={() => handleEdit(student)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
