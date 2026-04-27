'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Edit2, TrendingUp, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Partner {
  id: string;
  organizationName: string;
  schoolType: string;
  websiteUrl: string;
  status: string;
  courseNumber: number;
  lastInteraction?: string;
  earlyReleaseForSeniors: boolean;
  contacts: Array<{ name: string; email: string; title: string }>;
}

interface PartnerCardProps {
  partner: Partner;
  onDelete: (id: string) => void;
}

function PartnerCard({ partner, onDelete }: PartnerCardProps) {
  const primaryContact = partner.contacts[0];

  return (
    <Link key={partner.id} href={`/partners/${partner.id}`} className="group block bg-card border border-border rounded-lg p-6 hover:shadow-sm hover:border-primary/20 transition-all">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {partner.organizationName}
            </h3>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border',
              partner.status === 'Active' ? 'bg-success/10 text-success border-success/20' :
              partner.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' :
              'bg-muted/10 text-muted-foreground border-muted/20'
            )}>
              {partner.status || 'N/A'}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="bg-muted/50 px-2.5 py-1 rounded-md">{partner.schoolType}</span>
            <span className="bg-muted/50 px-2.5 py-1 rounded-md">Course #{partner.courseNumber}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Primary Contact</p>
              <p className="text-sm font-medium text-foreground">{primaryContact?.name || 'No Contact'}</p>
              <p className="text-xs text-muted-foreground">{primaryContact?.title || 'Unknown'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Last Interaction</p>
              <p className="text-sm font-medium text-foreground">
                {partner.lastInteraction ? new Date(partner.lastInteraction).toLocaleDateString() : 'No interactions'}
              </p>
              {partner.earlyReleaseForSeniors && (
                <p className="text-xs text-success mt-1">Early Release Ready</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex md:flex-col gap-2 shrink-0">
          {primaryContact?.email && (
            <button
              onClick={(e) => { e.preventDefault(); window.location.href = `mailto:${primaryContact.email}`; }}
              className="p-2.5 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
              title="Send email"
            >
              <Mail size={18} />
            </button>
          )}
          <Link
            href={`/partners/${partner.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            title="Edit partner"
          >
            <Edit2 size={18} />
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(partner.id); }}
            className="p-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
            title="Delete partner"
          >
            <Trash2 size={18} />
          </button>
          <Link
            href={`/email?partnerId=${partner.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-colors"
            title="View interactions"
          >
            <TrendingUp size={18} />
          </Link>
        </div>
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm font-medium">Loading partnerships...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border-2 border-dashed border-border p-16 text-center">
      <Search size={32} className="mx-auto text-muted-foreground mb-4" />
      <p className="text-lg font-semibold text-foreground">No matching partners</p>
      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or add a new partner.</p>
    </div>
  );
}

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/partners');
      if (!res.ok) throw new Error('Failed to fetch partners');
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/partners/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPartners(prev => prev.filter(p => p.id !== id));
      } else {
        console.error('Failed to delete partner');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch = partner.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contacts.some(contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const partnerStatus = partner.status?.toLowerCase() || '';
    const matchesStatus = filterStatus === 'all' || partnerStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Partners Directory</h1>
            <p className="mt-2 text-muted-foreground">Manage partnerships and track interactions.</p>
          </div>
          <Link href="/partners/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors shadow-sm border border-primary/20">
            <Plus size={18} /> Create Partner
          </Link>
        </section>

        <section className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search partners or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-input border border-border rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </section>

        <section className="grid gap-5">
          {loading ? (
            <LoadingState />
          ) : filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onDelete={handleDeletePartner}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
}

