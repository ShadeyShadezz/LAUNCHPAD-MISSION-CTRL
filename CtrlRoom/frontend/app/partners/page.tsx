
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Mail, Edit2 } from 'lucide-react';

interface Partner {
  id: string;
  organizationName: string;
  schoolType: string;
  websiteUrl: string;
  status: string;
  courseNumber: number;
  lastInteraction?: string;
  earlyReleaseForSeniors: boolean;
  contacts: Array<{
    name: string;
    email: string;
    title: string;
  }>;
}

const PartnersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/partners');
      const data = await res.json();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch = p.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contacts.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || (p.status && p.status.toLowerCase() === filterStatus);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>
              Partners Directory
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
              Manage partnerships and track interactions
            </p>
          </div>
          <Link
            href="/partners/new"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 focus:ring-4 focus:ring-[var(--primary)]/30 transition-all duration-200"
            style={{ background: "linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)" }}
          >
            <Plus size={20} />
            Add Partner
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3" size={20} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search partners or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--input)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(14, 165, 164, 0.1)`;
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Partners List */}
        <div className="grid gap-4">
          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => (
              <Link
                key={partner.id}
                href={`/partners/${partner.id}`}
                className="rounded-lg border p-6 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                        {partner.organizationName}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: partner.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: partner.status === 'Active' ? 'var(--success)' : 'var(--warning)',
                        }}
                      >
                        {partner.status || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
                      {partner.schoolType} • Course #{partner.courseNumber}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
                          Primary Contact
                        </p>
                        <p style={{ color: "var(--foreground)" }}>{partner.contacts[0]?.name || 'No Contact'}</p>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                          {partner.contacts[0]?.title || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
                          Last Interaction
                        </p>
                        <p style={{ color: "var(--foreground)" }}>
                          {partner.lastInteraction ? new Date(partner.lastInteraction).toLocaleDateString() : 'No interactions'}
                        </p>
                        {partner.earlyReleaseForSeniors && (
                          <p className="text-xs" style={{ color: "var(--success)" }}>
                            Early Release: Yes
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {partner.contacts[0]?.email && (
                      <a
                        href={`mailto:${partner.contacts[0].email}`}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: 'rgba(249, 115, 22, 0.1)',
                          color: 'var(--accent)',
                        }}
                        onClick={(e) => e.preventDefault()}
                      >
                        <Mail size={18} />
                      </a>
                    )}
                    <button
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: 'rgba(14, 165, 164, 0.1)',
                        color: 'var(--primary)',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <Link
                      href={`/integrations/gmail?partnerId=${partner.id}`}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--success)',
                      }}
                    >
<Mail size={18} />
                    </Link>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div
              className="rounded-lg border p-8 text-center"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <p style={{ color: "var(--muted-foreground)" }}>
                No partners found. Try adjusting your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;

