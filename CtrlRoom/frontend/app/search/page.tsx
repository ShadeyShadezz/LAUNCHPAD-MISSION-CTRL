'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  primaryContact: string;
  email: string;
}

interface Interaction {
  id: string;
  partner: string;
  type: string;
  staff: string;
  notes: string;
  date: string;
}

interface Student {
  id: string;
  name: string;
  cohort: string;
  partner: string;
  status: string;
}

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const searchResults = {
    partners: [] as Partner[],
    interactions: [] as Interaction[],
    students: [] as Student[],
  };

  const tabs = [
    { id: 'all', label: 'All Results', count: 0 },
    { id: 'partners', label: 'Partners', count: 0 },
    { id: 'interactions', label: 'Interactions', count: 0 },
    { id: 'students', label: 'Students', count: 0 },
  ];

  const getResults = () => {
    if (activeTab === 'all') {
      return { partners: searchResults.partners, interactions: searchResults.interactions, students: searchResults.students };
    }
    const key = activeTab as keyof typeof searchResults;
    return { [activeTab]: searchResults[key] };
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Global Search
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-3" size={20} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search partners, interactions, students..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        {query && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-3 font-semibold border-b-2 transition-all"
                  style={{
                    borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-4">
              {getResults().partners?.map((partner) => (
                <Link
                  key={partner.id}
                  href={`/partners/${partner.id}`}
                  className="rounded-lg border p-6 transition-all hover:shadow-lg block"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                        {partner.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {partner.type} · {partner.status}
                      </p>
                      <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
                        Primary: {partner.primaryContact} ({partner.email})
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(14, 165, 164, 0.1)',
                        color: 'var(--primary)',
                      }}
                    >
                      Partner
                    </span>
                  </div>
                </Link>
              ))}

              {getResults().interactions?.map((interaction) => (
                <Link
                  key={interaction.id}
                  href={`/interactions/${interaction.id}`}
                  className="rounded-lg border p-6 transition-all hover:shadow-lg block"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                        {interaction.partner} - {interaction.type}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        By {interaction.staff} on {new Date(interaction.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
                        {interaction.notes}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        color: 'var(--accent)',
                      }}
                    >
                      Interaction
                    </span>
                  </div>
                </Link>
              ))}

              {getResults().students?.map((student) => (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="rounded-lg border p-6 transition-all hover:shadow-lg block"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                        {student.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {student.cohort} · {student.partner}
                      </p>
                      <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
                        Status: {student.status}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--success)',
                      }}
                    >
                      Student
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {!query && (
          <div
            className="rounded-lg border p-12 text-center"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <p style={{ color: 'var(--muted-foreground)' }}>
              Type in the search box above to find partners, interactions, or students.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
