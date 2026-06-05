'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Mail } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  title?: string | null;
  type: 'leadership' | 'primary' | 'secondary';
}

interface PartnerDetails {
  id: string;
  organizationName: string;
  partnerType?: string | null;
  partnerStatus?: string | null;
  officialStartDate?: string | null;
  earlyReleaseForSeniors: boolean;
  pastCohortMembers: string[];
  contacts: Contact[];
  activityLogs: Array<{
    id: string;
    action: string;
    details: string;
    createdAt: string;
  }>;
}

export default function PartnerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [partner, setPartner] = useState<PartnerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchPartner() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/partners/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError('Failed to load partner details');
          setLoading(false);
          return;
        }
        const data = await res.json();
        const mapped: PartnerDetails = {
          id: data.id,
          organizationName: data.organizationName,
          partnerType: data.partnerType,
          partnerStatus: data.partnerStatus,
          officialStartDate: data.officialStatusDate ? data.officialStatusDate : null,
          earlyReleaseForSeniors: data.earlyReleaseForSeniors,
          pastCohortMembers: Array.isArray(data.pastCohortMembers) ? data.pastCohortMembers.map((c: any) => typeof c === 'string' ? c : JSON.stringify(c)) : [],
          contacts: (data.contacts || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            title: c.title,
            type: (c.contactType || '').toLowerCase() as 'leadership' | 'primary' | 'secondary',
          })),
          activityLogs: (data.interactions || []).map((ix: any) => ({
            id: ix.id,
            action: ix.interactionType,
            details: ix.sharedNotes || '',
            createdAt: ix.createdAt,
          })),
        };
        setPartner(mapped);
      } catch {
        setPartner(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPartner();
  }, [id]);

  if (loading) return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-6xl">
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
  if (notFound) return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-6xl">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Partner Not Found</h2>
          <p className="text-muted-foreground mb-6">The partner you are looking for does not exist.</p>
          <button onClick={() => router.push('/partners')} className="lmc-btn-inline px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm">
            Back to Partners
          </button>
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-6xl">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-destructive font-semibold mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="lmc-btn-inline px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm">
            Retry
          </button>
        </div>
      </div>
    </div>
  );
  if (!partner) return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-6xl">
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
      </div>
    </div>
  );

  const leadership = partner.contacts.filter(c => c.type === 'leadership');
  const primary = partner.contacts.filter(c => c.type === 'primary');
  const secondary = partner.contacts.filter(c => c.type === 'secondary');

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-6xl">
      <div className="lmc-page-header">
        <div>
          <h1 className="lmc-page-title">{partner.organizationName}</h1>
          <p className="lmc-page-subtitle">Partnership profile, contacts, and recent activity.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leadership */}
        <div className="lmc-surface p-6 flex flex-col gap-3 relative overflow-hidden">
          <div className="lmc-gradient-bar" />
          <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            Leadership
          </h2>
          {leadership.length === 0 && <div className="text-muted-foreground text-sm">No leadership contacts.</div>}
          {leadership.map(c => (
            <div key={c.id} className="mb-3">
              <div className="font-semibold text-foreground">{c.name}</div>
              {c.title && <div className="text-sm text-muted-foreground/70">{c.title}</div>}
              <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline transition-colors">{c.email}</a>
            </div>
          ))}
        </div>
        {/* Primary */}
        <div className="lmc-surface p-6 flex flex-col gap-3 relative overflow-hidden">
          <div className="lmc-gradient-bar" />
          <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            Primary
          </h2>
          {primary.length === 0 && <div className="text-muted-foreground text-sm">No primary contacts.</div>}
          {primary.map(c => (
            <div key={c.id} className="mb-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">{c.name}</div>
                {c.title && <div className="text-sm text-muted-foreground/70">{c.title}</div>}
                <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline transition-colors">{c.email}</a>
              </div>
              <a
                href={`mailto:${c.email}`}
                className="lmc-action-btn"
                title="Quick Email"
              >
                <Mail size={16} />
              </a>
            </div>
          ))}
        </div>
        {/* Secondary */}
        <div className="lmc-surface p-6 flex flex-col gap-3 relative overflow-hidden">
          <div className="lmc-gradient-bar" />
          <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            Secondary
          </h2>
          {secondary.length === 0 && <div className="text-muted-foreground text-sm">No secondary contacts.</div>}
          {secondary.map(c => (
            <div key={c.id} className="mb-3">
              <div className="font-semibold text-foreground">{c.name}</div>
              {c.title && <div className="text-sm text-muted-foreground/70">{c.title}</div>}
              <a href={`mailto:${c.email}`} className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">{c.email}</a>
            </div>
          ))}
        </div>
      </div>
      {/* Sidebar Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-start-3 lmc-surface p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="lmc-gradient-bar" />
          <h2 className="text-base md:text-lg font-bold text-foreground">Partnership Status</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Partner Type</span>
              <span className="text-foreground font-semibold">{partner.partnerType || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Partner Status</span>
              <span className="text-foreground font-semibold">{partner.partnerStatus || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Official Start Date</span>
              <span className="text-foreground font-semibold">{partner.officialStartDate ? new Date(partner.officialStartDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Early Release</span>
              {partner.earlyReleaseForSeniors ? (
                <span className="lmc-status-badge lmc-status-badge--eligible">Eligible</span>
              ) : (
                <span className="lmc-status-badge lmc-status-badge--ineligible">Not Eligible</span>
              )}
            </div>
            <div className="pt-1">
              <span className="text-muted-foreground font-medium text-sm">Past Cohorts</span>
              <ul className="mt-2 space-y-1">
                {partner.pastCohortMembers.length === 0 ? (
                  <li className="text-muted-foreground/60 text-xs italic">None recorded</li>
                ) : partner.pastCohortMembers.map((c, i) => (
                  <li key={i} className="inline-flex mr-1.5 mb-1 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/50 text-foreground border border-border/60">{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Interactions */}
      <div>
        <h2 className="text-base md:text-lg font-bold text-foreground mb-4">Recent Interactions</h2>
        <div className="lmc-surface overflow-hidden">
          {partner.activityLogs.length === 0 ? (
            <div className="p-6 text-muted-foreground text-sm text-center">No recent interactions recorded.</div>
          ) : (
            <ul className="divide-y divide-border/50">
              {partner.activityLogs.map(log => (
                <li key={log.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mr-2">{log.action}</span>
                    {log.details && <span className="text-sm text-foreground/80">{log.details}</span>}
                  </div>
                  <time className="text-xs text-muted-foreground/60 whitespace-nowrap shrink-0">{new Date(log.createdAt).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
