'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ChevronDown, ChevronRight, Building2, Users, Calendar, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { ListSkeletonComponent } from '@/app/components/skeletons';

type Contact = {
  id: string;
  contactType: string;
  name: string;
  email: string;
  title: string | null;
};

type Interaction = {
  id: string;
  interactionType: string;
  interactionLabel: string;
  date: string;
  studentCount: number;
  sharedNotes: string | null;
  needsFollowup: boolean;
  followupDueDate: string | null;
  createdAt: string;
  staffName: string;
  staffEmail: string;
};

type CreatedBy = {
  id: string;
  fullName: string;
  email: string;
};

type PartnerRecord = {
  id: string;
  organizationName: string;
  logoUrl: string | null;
  industry: string | null;
  description: string | null;
  websiteUrl: string | null;
  partnerType: string | null;
  partnerStatus: string | null;
  officialStatusDate: string | null;
  currentStatusNotes: string | null;
  earlyReleaseForSeniors: boolean;
  pastCohortMembers: unknown;
  contacts: Contact[];
  interactions: Interaction[];
  createdBy: CreatedBy | null;
};

function MissingBadge({ label }: { label: string }) {
  return <span className="missing-badge">{label}</span>;
}

function InfoBox({ label, value, span, missing }: { label: string; value: string; span?: boolean; missing?: boolean }) {
  return (
    <div className={span ? 'md:col-span-2 lg:col-span-3' : ''}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      {missing ? (
        <MissingBadge label={value} />
      ) : (
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      )}
    </div>
  );
}

export default function PartnershipsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) router.push('/login');
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMINISTRATOR') {
      setError('Access restricted to administrators');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    fetch('/api/partnerships', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Access restricted to administrators');
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const formatDate = useCallback((d: string | null | undefined) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const renderPastCohort = useCallback((data: unknown) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    const items = data as Array<unknown>;
    return (
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Past Cohort Members</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="inline-flex px-2.5 py-1 rounded-full text-xs bg-muted text-foreground border border-border">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </span>
          ))}
        </div>
      </div>
    );
  }, []);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Inactive': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="spinner-ring-lg" />
      </div>
    );
  }
  if (!user) return null;

  if (user.role !== 'ADMINISTRATOR') {
    return (
      <div className="h-full flex items-center justify-center px-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">This page is available to administrators only.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-7xl">
        <div className="lmc-page-header">
          <h1 className="lmc-page-title">Display &mdash; All Partnerships</h1>
          {!loading && !error && (
            <p className="lmc-page-subtitle">
              Full database view &mdash; {partners.length} partner{partners.length !== 1 ? 's' : ''} loaded.
            </p>
          )}
        </div>

        {/* ─── ERROR ─── */}
        {error && !loading && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3.5 text-red-500 font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button className="underline text-sm" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* ─── SKELETON ─── */}
        {loading && (
          <div className="divide-y divide-border rounded-xl bg-card border border-border shadow-sm">
            <ListSkeletonComponent rows={4} />
          </div>
        )}

        {/* ─── EMPTY ─── */}
        {!loading && !error && partners.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">No partnerships found</p>
            <p className="text-sm text-muted-foreground mt-1">Add partners through the Partners page first.</p>
            <Link href="/partners/new" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md">
              Add Partner
            </Link>
          </div>
        )}

        {/* ─── PARTNERS ─── */}
        {!loading && !error && partners.length > 0 && (
          <div className="flex flex-col gap-3">
            {partners.map((p) => (
              <div key={p.id} className="lmc-surface lmc-surface--interactive overflow-hidden">
                {/* List row */}
                <button
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-muted/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-muted-foreground/40 shrink-0 transition-transform duration-200" style={{ transform: expandedId === p.id ? 'rotate(90deg)' : undefined }}>
                      <ChevronRight size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-foreground truncate mb-1.5">{p.organizationName}</h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5">
                        <span className={`inline-flex px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(p.partnerStatus)}`}>
                          {p.partnerStatus || <MissingBadge label="Not Set" />}
                        </span>
                        {p.partnerType ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-muted/50 text-muted-foreground/70 border border-border/60">
                            {p.partnerType}
                          </span>
                        ) : (
                          <MissingBadge label="No Type" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/30 text-muted-foreground/70">
                      <Users size={13} /> {p.contacts.length}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/30 text-muted-foreground/70">
                      <Calendar size={13} /> {p.interactions.length}
                    </span>
                  </div>
                </button>

                {/* Expanded content */}
                {expandedId === p.id && (
                  <div className="border-t border-border/50 px-6 py-5 space-y-5 animate-fade-in bg-muted/20">
                    {/* Core Information */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <BadgeCheck size={14} /> Core Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoBox label="Industry" value={p.industry || 'Not Specified'} missing={!p.industry} />
                        {p.websiteUrl ? (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Website</p>
                            <a href={p.websiteUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline break-all">
                              {p.websiteUrl}
                            </a>
                          </div>
                        ) : (
                          <InfoBox label="Website" value="Not Set" missing={true} />
                        )}
                        <InfoBox label="Partner Type" value={p.partnerType || 'Not Specified'} missing={!p.partnerType} />
                        <InfoBox label="Official Status Date" value={formatDate(p.officialStatusDate) || 'Not Recorded'} missing={!p.officialStatusDate} />
                        <InfoBox label="Early Release for Seniors" value={p.earlyReleaseForSeniors ? 'Yes' : 'No'} />
                        {p.description ? (
                          <InfoBox label="Organization Description" value={p.description} span={true} />
                        ) : (
                          <InfoBox label="Organization Description" value="No Description" span={true} missing={true} />
                        )}
                        {p.currentStatusNotes ? (
                          <InfoBox label="Status Notes" value={p.currentStatusNotes} span={true} />
                        ) : (
                          <InfoBox label="Status Notes" value="No Status Notes" span={true} missing={true} />
                        )}
                        {p.createdBy ? (
                          <InfoBox label="Created By" value={`${p.createdBy.fullName} (${p.createdBy.email})`} span={true} />
                        ) : (
                          <InfoBox label="Created By" value="Unknown Creator" span={true} missing={true} />
                        )}
                      </div>
                    </div>

                    {/* Contacts */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Users size={14} /> Contacts ({p.contacts.length})
                      </h4>
                      {p.contacts.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                          <MissingBadge label="No Contacts on File" />
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {p.contacts.map((c) => (
                            <div key={c.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{c.name || <MissingBadge label="Unnamed Contact" />}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {c.email || <MissingBadge label="No Email" />}
                                  {c.title ? <span> &middot; {c.title}</span> : <span className="ml-1"><MissingBadge label="No Title" /></span>}
                                </p>
                                <span className="inline-flex px-2 py-0.5 mt-1 rounded text-[10px] font-semibold uppercase bg-primary/10 text-primary">
                                  {c.contactType}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    partnerId: p.id,
                                    orgName: p.organizationName,
                                    contactEmail: c.email,
                                    contactName: c.name,
                                    subject: `Partnership with ${p.organizationName}`,
                                  });
                                  router.push(`/email?${params.toString()}`);
                                }}
                                disabled={!c.email}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-2.5 py-1.5 text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Mail size={12} />
                                Email
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactions */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Calendar size={14} /> Interactions ({p.interactions.length})
                      </h4>
                      {p.interactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                          <MissingBadge label="No Interactions Recorded" />
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {p.interactions.map((ix) => (
                            <div key={ix.id} className="rounded-lg border border-border bg-card p-3">
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <span className="text-sm font-semibold text-foreground">{ix.interactionLabel}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(ix.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                <span>By: <span className="font-medium text-foreground">{ix.staffName || <MissingBadge label="Unknown" />}</span></span>
                                <span>Students: <span className="font-medium text-foreground">{ix.studentCount ?? 0}</span></span>
                                {ix.needsFollowup && (
                                  <span className="text-amber-500 font-medium">
                                    Follow-up: {ix.followupDueDate ? formatDate(ix.followupDueDate) : 'Due'}
                                  </span>
                                )}
                              </div>
                              {ix.sharedNotes ? (
                                <p className="mt-1.5 text-xs text-muted-foreground bg-muted rounded px-2 py-1 border border-border">
                                  {ix.sharedNotes}
                                </p>
                              ) : (
                                <p className="mt-1.5 text-xs flex items-center gap-1">
                                  <MissingBadge label="No Notes Recorded" />
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Past Cohort Members */}
                    {renderPastCohort(p.pastCohortMembers)}
                  </div>
                )}
              </div>
            ))}
          </div>
      )}
    </div>
  </div>
  );
}
