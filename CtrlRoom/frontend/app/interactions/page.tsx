"use client";

import { useState, useEffect } from 'react';

interface Interaction {
  id: string;
  interactionType: string;
  date: string;
  studentCount: number;
  sharedNotes: string;
  needsFollowup: boolean;
  followupDueDate: string;
  partner: { organizationName: string };
}

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    const res = await fetch('http://localhost:5000/api/interactions');
    const data = await res.json();
    setInteractions(data);
    setLoading(false);
  };

  const [formData, setFormData] = useState({
    partnerId: '',
    interactionType: '',
    staffId: 'temp-staff',
    date: '',
    studentCount: 0,
    sharedNotes: '',
    needsFollowup: false,
    followupDueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    fetchInteractions();
  };

  if (loading) return <div className="container mx-auto py-10">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Interactions</h1>

      {/* Create Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-6">New Interaction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form fields: partnerId select, type dropdown, date, etc */}
          <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium">
            Create Interaction
          </button>
        </form>
      </div>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Partner</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Students</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Followup</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {interactions.map((int) => (
              <tr key={int.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{int.interactionType}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{int.partner.organizationName}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{new Date(int.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{int.studentCount}</td>
                <td className="px-6 py-4">
                  {int.needsFollowup && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Followup {int.followupDueDate && new Date(int.followupDueDate).toLocaleDateString()}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
