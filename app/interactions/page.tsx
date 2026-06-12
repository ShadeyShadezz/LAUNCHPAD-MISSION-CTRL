'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, AlertCircle, Calendar, Users, TrendingUp, Clock, MessageSquareQuote, Building2, UserCheck, Target, ArrowUpRight, Sparkles } from 'lucide-react';
import { api } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { clsx } from 'clsx';
import { ListSkeletonComponent } from '@/app/components/skeletons';
import { buttonVariants } from '@/app/components/Button';

interface Interaction {
  id: string;
  createdAt: string;
  date: string;
  partner: { id: string; organizationName: string };
  interactionType: string;
  staff: { id: string; fullName: string; email: string };
  studentCount: number;
  sharedNotes: string | null;
  needsFollowup: boolean;
  followupDueDate: string | null;
}

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  INFOSESSION: 'Infosession',
  TABLING: 'Tabling',
  MEETING: 'Meeting',
  OUTREACH: 'Outreach',
  INTERVIEWS: 'Interviews',
  STUDENT_APPLICATION: 'Student Application',
};

const INTERACTION_TYPE_ICONS: Record<string, typeof Target> = {
  INFOSESSION: Users,
  TABLING: Users,
  MEETING: UserCheck,
  OUTREACH: TrendingUp,
  INTERVIEWS: Target,
  STUDENT_APPLICATION: Sparkles,
};

function MissingBadge({ label }: { label: string }) {
  return <span className="missing-badge">{label}</span>;
}

export default function InteractionsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; fullName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) router.push('/login');
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    fetchInteractions();
    fetchStaff();
  }, []);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const data = await api.getInteractions();
      setInteractions(Array.isArray(data) ? data : []);
    } catch {
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaffList(Array.isArray(data) ? data : []);
    } catch {
      setStaffList([]);
    }
  };

  const getTypeLabel = useCallback((type: string) => {
    return INTERACTION_TYPE_LABELS[type] || type.replace(/_/g, ' ');
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    const Icon = INTERACTION_TYPE_ICONS[type] || Calendar;
    return Icon;
  }, []);

  const filteredInteractions = interactions.filter((i) => {
    const matchesSearch =
      (i.partner?.organizationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.staff?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.sharedNotes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || i.interactionType === filterType;
    const matchesStaff = filterStaff === 'all' || i.staff?.fullName === filterStaff;
    return matchesSearch && matchesType && matchesStaff;
  });

  const stats = [
    { label: 'Total Interactions', value: interactions.length, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Students Reached', value: interactions.reduce((sum, i) => sum + (i.studentCount ?? 0), 0), icon: Users, color: 'text-brand-600', bg: 'bg-brand-500/10' },
    { label: 'Active Staff', value: new Set(interactions.map(i => i.staff?.fullName)).size, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-500/10' },
    { label: 'Pending Follow-ups', value: interactions.filter(i => i.needsFollowup).length, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  if (isAuthLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="spinner-ring-lg" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-7xl">
        <div className="lmc-page-header gap-3">
          <span className="lmc-kicker">Interaction Tracking</span>
          <div className="lmc-toolbar">
            <div>
              <h1 className="lmc-page-title">Interactions</h1>
              <p className="lmc-page-subtitle">Track every outreach, meeting, and engagement with partners.</p>
            </div>
            <button type="button" onClick={() => router.push('/interactions/new')} className={buttonVariants({ size: 'md' })}>
              <Plus size={16} /> New Interaction
            </button>
          </div>
        </div>

        {/* ─── SKELETON ─── */}
        {loading && (
          <div className="lmc-panel p-2">
            <ListSkeletonComponent rows={4} />
          </div>
        )}

        {/* ─── LOADED CONTENT ─── */}
        {!loading && (
          <>
            {/* Stats */}
            <section className="lmc-stat-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="lmc-stat-card">
                  <div className={clsx('p-2.5 rounded-lg mb-3', stat.bg)}>
                    <Icon size={18} className={stat.color} strokeWidth={2} />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1.5 leading-none text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </section>

          {/* Filters */}
          <div className="lmc-panel p-5 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={17} strokeWidth={2} />
              <input
                type="text"
                placeholder="Search partner, staff, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-xl border border-border/80 bg-secondary text-foreground pl-11 pr-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 hover:border-border"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-12 rounded-xl border border-border/80 bg-secondary text-foreground px-4 text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-border min-w-[150px]"
            >
              <option value="all">All Types</option>
              {Object.entries(INTERACTION_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="h-12 rounded-xl border border-border/80 bg-secondary text-foreground px-4 text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-border min-w-[150px]"
            >
              <option value="all">All Staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.fullName}>{staff.fullName}</option>
              ))}
            </select>
            </div>
          </div>

          {/* Interaction List */}
          <div className="space-y-1">
            {filteredInteractions.length === 0 ? (
              <div className="rounded-xl bg-card border border-border/80 p-12 text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Calendar size={22} className="text-muted-foreground/60" />
                </div>
                <p className="text-sm font-semibold text-foreground">No interactions found</p>
                <p className="text-sm text-muted-foreground/70 mt-1.5">Try adjusting your search or filters above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInteractions.map((i) => {
                  const TypeIcon = getTypeIcon(i.interactionType);
                  return (
                    <div
                      key={i.id}
                      className="lmc-interaction-card rounded-xl bg-card border border-border/80 p-6 shadow-sm hover:shadow-md hover:border-border transition-all duration-200"
                    >
                      {/* Top row: Type badge + Partner + Date */}
                      <div className="flex items-start justify-between gap-5 mb-5">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="lmc-type-icon">
                            <TypeIcon size={17} strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="lmc-type-badge">
                                {getTypeLabel(i.interactionType)}
                              </span>
                              <h3 className="text-sm font-bold text-foreground truncate flex items-center gap-2.5">
                                <Building2 size={14} className="text-primary/70 dark:text-brand-400 shrink-0" strokeWidth={1.5} />
                                {i.partner?.organizationName || <MissingBadge label="Unknown Partner" />}
                              </h3>
                            </div>
                          </div>
                        </div>
                        <time className="lmc-interaction-time text-sm text-muted-foreground/60 whitespace-nowrap shrink-0 font-medium">
                          {new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>

                      {/* Meta row */}
                      <div className="lmc-interaction-meta flex flex-wrap items-center gap-x-7 gap-y-2.5 mb-5 text-sm">
                        <span className="text-muted-foreground/85 flex items-center gap-2.5">
                          <UserCheck size={13} className="text-primary/65 dark:text-brand-400" strokeWidth={1.5} />
                          <span className="font-medium text-foreground">{i.staff?.fullName || <MissingBadge label="Unknown" />}</span>
                        </span>
                        <span className="text-muted-foreground/85 flex items-center gap-2.5">
                          <Calendar size={13} className="text-primary/65 dark:text-brand-400" strokeWidth={1.5} />
                          <span className="font-medium text-foreground">{i.date ? new Date(i.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : <MissingBadge label="Not Set" />}</span>
                        </span>
                        <span className="text-muted-foreground/85 flex items-center gap-2.5">
                          <Users size={13} className="text-primary/65 dark:text-brand-400" strokeWidth={1.5} />
                          <span className="lmc-student-count">{i.studentCount ?? 0} students</span>
                        </span>
                        {i.needsFollowup && (
                          <span className="lmc-followup-badge">
                            <AlertCircle size={11} strokeWidth={2} />
                            Follow-up {i.followupDueDate ? `due ${new Date(i.followupDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'needed'}
                          </span>
                        )}
                      </div>

                      {/* Notes — the WHY */}
                      {i.sharedNotes && i.sharedNotes.trim().length > 0 ? (
                        <div className="lmc-interaction-notes rounded-lg border border-border/70 bg-secondary/65 px-4 py-3.5">
                          <div className="flex items-start gap-4">
                            <MessageSquareQuote size={14} className="text-primary dark:text-brand-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                            <div>
                              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5">Why this happened</p>
                              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{i.sharedNotes}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="lmc-interaction-notes lmc-interaction-notes--empty rounded-lg border border-dashed border-border/55 bg-secondary/40 px-4 py-3.5">
                          <div className="flex items-center gap-4">
                            <MessageSquareQuote size={14} className="text-muted-foreground/65" strokeWidth={1.5} />
                            <span className="text-sm text-muted-foreground/80 italic">No notes recorded for this interaction</span>
                          </div>
                        </div>
                      )}

                      {/* Bottom: Logged to activity log badge */}
                      <div className="lmc-interaction-footer mt-4 flex items-center gap-3">
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground/70 font-medium uppercase tracking-wider">
                          <ArrowUpRight size={10} strokeWidth={2} />
                          Logged to activity log
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Follow-ups section */}
            {interactions.some(i => i.needsFollowup) && (
              <div className="mt-8 pt-6 border-t border-border/60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-md bg-warning/10 flex items-center justify-center">
                    <AlertCircle size={13} className="text-warning" strokeWidth={2} />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Needs Follow-up</h2>
                  <span className="text-sm font-semibold text-warning/70 bg-warning/10 px-1.5 py-0.5 rounded">{interactions.filter(i => i.needsFollowup).length}</span>
                </div>
                <div className="space-y-3">
                  {interactions.filter(i => i.needsFollowup).map((f) => (
                    <div key={f.id} className="lmc-followup-row rounded-lg border border-border/60 bg-card p-5 hover:shadow-sm transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                              {getTypeLabel(f.interactionType)}
                            </span>
                            <p className="text-sm font-semibold text-foreground truncate">
                              {f.partner?.organizationName || <MissingBadge label="Unknown" />}
                            </p>
                          </div>
                          {f.sharedNotes && <p className="text-sm text-muted-foreground/70 mt-1 line-clamp-2">{f.sharedNotes}</p>}
                          <p className="text-sm text-muted-foreground/50 mt-1.5">
                            Staff: <span className="font-semibold text-foreground/70">{f.staff?.fullName || <MissingBadge label="Unknown" />}</span>
                          </p>
                        </div>
                        {f.followupDueDate && (
                          <span className="lmc-followup-badge rounded-lg shrink-0 whitespace-nowrap">
                            <Clock size={12} strokeWidth={2} />
                            Due {new Date(f.followupDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </div>
  );
}
