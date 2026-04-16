"use client";

import { useEffect, useState } from 'react';

interface DashboardData {
  recentInteractions: Array<{
    date: string;
    interactionType: string;
    partner: { organizationName: string };
  }>;
  pendingFollowups: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/staff/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto py-10">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Pending Follow-ups</h2>
          <div className="text-4xl font-bold text-yellow-600">{data?.pendingFollowups || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Recent Interactions</h2>
          <div className="space-y-2">
            {data?.recentInteractions.slice(0,3).map((int, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{int.interactionType}</span>
                <span>{int.partner.organizationName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
