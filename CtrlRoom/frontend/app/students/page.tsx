'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Users, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { api } from '@/lib/api';

interface Student {
  id: string;
  fullName: string;
  email?: string;
  status: string;
  cohort?: string;
  earlyReleaseEligible: boolean;
  partner: { organizationName: string };
  addedDate: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.partner.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.cohort?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE_MEMBER': return 'text-green-600 bg-green-50';
      case 'APPLICANT': return 'text-blue-600 bg-blue-50';
      case 'ALUMNI': return 'text-purple-600 bg-purple-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
              Students Directory
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Manage student records and partnerships
            </p>
          </div>
          <Link
            href="/students/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Student
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
          />
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading students...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No students found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first student.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {student.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {student.partner.organizationName}
                    </p>
                  </div>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStatusColor(student.status)
                  )}>
                    {student.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {student.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{student.email}</span>
                    </div>
                  )}
                  {student.cohort && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen size={14} />
                      <span>{student.cohort}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    <span>Added {new Date(student.addedDate).toLocaleDateString()}</span>
                  </div>
                  {student.earlyReleaseEligible && (
                    <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600">
                      Early Release Eligible
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/students/${student.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Edit2 size={14} />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;

