'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, Calendar, Users, TrendingUp, Clock, Handshake } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { api } from '@/lib/api';

interface Interaction {
  id: string;
  date: string;
  partner: { organizationName: string };
  interactionType: string;
  staff: { fullName: string };
  studentCount: number;
  sharedNotes: string;
  needsFollowup: boolean;
  followupDueDate?: string;
}

interface PendingFollowUp {
  id: string;
  interaction: string;
  dueDate: string;
  owner: string;
  notes: string;
}

export default function InteractionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { label: 'Interactions This Month', value: interactions.length, icon: Calendar },
    { label: 'Student Reachable', value: interactions.reduce((sum, i) => sum + i.studentCount, 0), icon: Users },
    { label: 'Staff Contributions', value: new Set(interactions.map(i => i.staff?.fullName)).size, icon: TrendingUp },
    { label: 'Pending Follow-up', value: interactions.filter(i => i.needsFollowup).length, icon: Clock },
  ];

  const pendingFollowUps: PendingFollowUp[] = interactions
    .filter(i => i.needsFollowup && i.followupDueDate)
    .map(i => ({
      id: i.id,
      interaction: `${i.interactionType} with ${i.partner?.organizationName}`,
      dueDate: i.followupDueDate!,
      owner: i.staff?.fullName || 'Unknown',
      notes: i.sharedNotes || 'No notes provided',
    }));

  useEffect(() => {
    fetchInteractions();
    fetchStaff();
  }, []);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const data = await api.getInteractions();
      setInteractions(data);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    }
  };

  const filteredInteractions = interactions.filter((i) => {
    const matchesSearch = i.partner?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         i.staff?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         i.sharedNotes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || i.interactionType.toLowerCase() === filterType;
    const matchesStaff = filterStaff === 'all' || i.staff?.fullName === filterStaff;
    return matchesSearch && matchesType && matchesStaff;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Handshake size={28} />
            </h1>
            <p className="mt-2 text-muted-foreground">Track outreach activity and engagements.</p>
          </div>
          <Link href="/interactions/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={18} /> Log Interaction
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary"><Icon size={16} /></div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </section>

        <section className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Search by partner name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 bg-input border border-border rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="all">All Types</option>
            <option value="infosession">Infosession</option>
            <option value="meeting">Meeting</option>
            <option value="tabling">Tabling</option>
            <option value="outreach">Outreach</option>
            <option value="interviews">Interviews</option>
          </select>
          <select value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)} className="px-4 py-2.5 bg-input border border-border rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="all">All Staff</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.fullName}>{staff.fullName}</option>
            ))}
          </select>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Interactions</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading interactions...</p>
              </div>
            ) : filteredInteractions.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Users size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">No interactions found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredInteractions.map((i) => (
                <div key={i.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Date</p>
                      <p className="text-sm font-medium text-foreground">{new Date(i.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Partner</p>
                      <p className="text-sm font-medium text-foreground">{i.partner?.organizationName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Type</p>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {i.interactionType.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Staff</p>
                      <p className="text-sm font-medium text-foreground">{i.staff?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Students</p>
                      <p className="text-lg font-bold text-success">{i.studentCount}</p>
                    </div>
                  </div>
                  <p className="mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground">{i.sharedNotes}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <AlertCircle size={16} className="text-warning" /> Needs Follow-up
          </h2>
          <div className="space-y-3">
            {pendingFollowUps.map((f) => (
              <div key={f.id} className="bg-card border-l-4 border-warning rounded-r-lg p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{f.interaction}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{f.notes}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Assigned to: <span className="font-medium text-foreground">{f.owner}</span></p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-warning/10 text-warning shrink-0">
                    <Clock size={12} /> Due {new Date(f.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

