'use client';

import { Edit2, Trash2, UserPlus, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/app/context/AuthContext';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await api.getStaff();
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.deleteStaff(id);
      setStaffList(staffList.filter(s => s.id !== id));
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
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
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
                {user?.fullName}
              </p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                Your Title / Role
              </p>
              <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                {user?.role} {user?.title && `- ${user.title}`}
              </p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                Email
              </p>
              <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                {user?.email}
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

        {/* Appearance Settings */}
        <div
          className="rounded-lg border p-8"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                Theme
              </h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Choose your preferred theme for the application
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border transition-all"
              style={{
                backgroundColor: "var(--secondary)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={20} />
                  <span className="text-sm font-medium">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={20} />
                  <span className="text-sm font-medium">Light Mode</span>
                </>
              )}
            </button>
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


      </div>
    </div>
  );
};

export default SettingsPage;
