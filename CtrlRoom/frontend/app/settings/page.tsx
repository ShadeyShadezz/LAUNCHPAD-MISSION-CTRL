'use client';

import { Edit2, Trash2, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

const SettingsPage = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/staff/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStaffList(staffList.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Settings
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Manage your workspace and staff
          </p>
        </div>

        {/* Your Profile */}
        <div
          className="rounded-lg border p-8"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
            Your Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                Full Name
              </p>
              <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                Sarah Jenkins
              </p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                Your Title / Role
              </p>
              <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                Administrator - Program Director
              </p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                Email
              </p>
              <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                sarah@launchpad.org
              </p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                Access Level
              </p>
              <p className="text-lg font-semibold" style={{ color: "var(--success)" }}>
                Full access
              </p>
            </div>
          </div>
        </div>

        {/* Staff Management */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Staff Directory
            </h2>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <UserPlus size={20} />
              Add Staff Member
            </button>
          </div>

          <div
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--secondary)", borderBottom: `1px solid var(--border)` }}>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Access Level
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr
                    key={staff.id}
                    style={{
                      borderBottom: `1px solid var(--border)`,
                      backgroundColor: "var(--card)",
                    }}
                    className="hover:opacity-75 transition-all"
                  >
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {staff.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: 'rgba(14, 165, 164, 0.1)',
                          color: 'var(--primary)',
                        }}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {staff.title}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {staff.accessLevel}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(staff.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: 'rgba(14, 165, 164, 0.1)',
                            color: 'var(--primary)',
                          }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--destructive)',
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Definitions */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
            Role Definitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                role: 'Administrator',
                permissions: ['Full access', 'Add/edit/delete partners', 'Manage staff', 'View activity log'],
              },
              {
                role: 'Program Coordinator',
                permissions: ['Add interactions', 'Update partner notes', 'Manage outreach', 'View all records'],
              },
              {
                role: 'Partnership Manager',
                permissions: ['Manage partner records', 'Update contacts', 'Track partnerships', 'View all records'],
              },
              {
                role: 'Staff User',
                permissions: ['View shared records', 'Edit own interactions', 'Log activities', 'Add students'],
              },
            ].map((item) => (
              <div
                key={item.role}
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <h3 className="font-bold mb-3" style={{ color: "var(--foreground)" }}>
                  {item.role}
                </h3>
                <ul className="space-y-2">
                  {item.permissions.map((perm) => (
                    <li key={perm} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      <span style={{ color: "var(--success)", marginTop: '2px' }}>✓</span>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
