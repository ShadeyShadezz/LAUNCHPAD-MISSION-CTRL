'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, TrendingUp, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/app/components/Button';

interface Partner {
  id: string;
  organizationName: string;
  logoUrl?: string | null;
  industry?: string | null;
  partnerStatus?: string | null;
  partnerType?: string | null;
  courseNumber?: number | null;
  earlyReleaseForSeniors: boolean;
  tags: string[];
  contacts: Array<{ id: string; name: string; email: string; title?: string | null }>;
}


function PartnerCard({ partner }: { partner: Partner }) {
  const router = useRouter();
  const primaryContact = partner.contacts[0];
  return (
    <div onClick={() => router.push(`/partners/${partner.id}`)} className="group lmc-surface lmc-surface--interactive block p-6 cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary truncate">{partner.organizationName}</h3>
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border',
                partner.partnerStatus === 'Active' ? 'bg-success/10 text-success border-success/20' :
                partner.partnerStatus === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' :
                'bg-muted/10 text-muted-foreground border-muted/20'
              )}>{partner.partnerStatus || 'N/A'}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
              {partner.industry && <span className="bg-muted/50 px-2 py-0.5 rounded">{partner.industry}</span>}
              {partner.partnerType && <span className="bg-muted/50 px-2 py-0.5 rounded">{partner.partnerType}</span>}
              {partner.courseNumber && <span className="bg-muted/50 px-2 py-0.5 rounded">Course #{partner.courseNumber}</span>}
            </div>
            <div className="flex flex-col gap-0.5 text-xs">
              {primaryContact?.name && <span className="font-medium text-foreground">{primaryContact.name}</span>}
              {primaryContact?.email && <span className="text-primary">{primaryContact.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={e => { e.stopPropagation(); router.push(`/partners/${partner.id}/edit`); }} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer" title="Edit partner"><Edit2 size={16} /></button>
          <button onClick={e => { e.stopPropagation(); router.push(`/email?partnerId=${partner.id}`); }} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success hover:bg-success hover:text-success-foreground transition-colors cursor-pointer" title="Send email"><TrendingUp size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="lmc-surface p-10 text-center">
      <span className="text-muted-foreground">Loading...</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="lmc-surface flex flex-col items-center justify-center py-20 gap-4">
      <Building2 size={48} className="text-muted-foreground mb-1" />
      <p className="text-lg font-semibold text-foreground">No partners found</p>
      <p className="text-sm text-muted-foreground mt-1">Add a new partner to get started.</p>
    </div>
  );
}


export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganizations() {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/partners', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch partners');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((org: any) => ({
          id: org.id,
          organizationName: org.organizationName,
          logoUrl: org.logoUrl,
          industry: org.industry,
          partnerStatus: org.partnerStatus,
          partnerType: org.partnerType,
          courseNumber: org.courseNumber,
          earlyReleaseForSeniors: org.earlyReleaseForSeniors,
          tags: org.tags || [],
          contacts: org.contacts || [],
        }));
        setPartners(mapped);
      } catch (error) {
        console.error(error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizations();
  }, []);


  // Delete logic can be added if needed

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-5xl">
        <div className="lmc-page-header">
          <div>
            <h1 className="lmc-page-title">Partners Directory</h1>
            <p className="lmc-page-subtitle">Browse organizations, contacts, and partnership status at a glance.</p>
          </div>
          <Link href="/partners/new">
            <Button className="inline-flex items-center gap-2.5">
              <Plus size={16} /> Add Partner
            </Button>
          </Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : partners.length > 0 ? (
          <div className="flex flex-col gap-3">
            {partners.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

