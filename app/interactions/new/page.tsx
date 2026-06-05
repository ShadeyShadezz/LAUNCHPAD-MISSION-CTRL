'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, FileText, Save, Building2, AlertCircle, MessageSquareQuote } from 'lucide-react';
import { api } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/Button';

interface Partner {
  id: string;
  organizationName: string;
}

const interactionTypes = [
  { value: 'INFOSESSION', label: 'Infosession', description: 'Informational session for students' },
  { value: 'TABLING', label: 'Tabling', description: 'Table at a career fair or event' },
  { value: 'MEETING', label: 'Meeting', description: 'One-on-one or group meeting' },
  { value: 'OUTREACH', label: 'Outreach', description: 'Proactive outreach to partner' },
  { value: 'INTERVIEWS', label: 'Interviews', description: 'Student interview coordination' },
  { value: 'STUDENT_APPLICATION', label: 'Student Application', description: 'Student submitted application' },
];

export default function NewInteractionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partnerId: '',
    interactionType: 'MEETING',
    date: new Date().toISOString().split('T')[0],
    studentCount: 0,
    sharedNotes: '',
    needsFollowup: false,
    followupDueDate: '',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const data = await api.getPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.partnerId) {
      alert('Please select a partner');
      return;
    }

    setLoading(true);
    try {
      await api.createInteraction({
        partnerId: formData.partnerId,
        interactionType: formData.interactionType,
        date: new Date(formData.date).toISOString(),
        studentCount: formData.studentCount,
        sharedNotes: formData.sharedNotes,
        needsFollowup: formData.needsFollowup,
        followupDueDate: formData.needsFollowup && formData.followupDueDate
          ? new Date(formData.followupDueDate).toISOString()
          : null,
      });
      router.push('/interactions');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-2xl">
        <div className="lmc-page-header">
          <h1 className="lmc-page-title">Log New Interaction</h1>
          <p className="lmc-page-subtitle">Record an outreach activity or engagement with a partner.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-card border border-border/80 p-6 md:p-8 shadow-sm space-y-6">
            {/* Partner Selection */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-foreground flex items-center gap-3">
                <Building2 size={16} className="text-muted-foreground/60" strokeWidth={1.5} />
                Partner <span className="lmc-required">*</span>
              </label>
              <select
                required
                value={formData.partnerId}
                onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
                className="h-12 w-full rounded-xl border border-border/80 bg-card text-foreground px-4 text-[15px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select a partner...</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.organizationName}
                  </option>
                ))}
              </select>
            </div>

            {/* Interaction Type */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-foreground flex items-center gap-3">
                <MessageSquareQuote size={16} className="text-muted-foreground/60" strokeWidth={1.5} />
                Interaction Type <span className="lmc-required">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interactionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({...formData, interactionType: type.value})}
                    className={`lmc-type-card ${
                      formData.interactionType === type.value
                        ? 'lmc-type-card--selected'
                        : 'lmc-type-card--deselected'
                    }`}
                  >
                    <span className="block text-[15px] font-bold">{type.label}</span>
                    <span className="lmc-type-card__desc">
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-foreground flex items-center gap-3">
                <Calendar size={16} className="text-muted-foreground/60" strokeWidth={1.5} />
                Date <span className="lmc-required">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="h-12 w-full rounded-xl border border-border/80 bg-card text-foreground px-4 text-[15px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Student Count */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-foreground flex items-center gap-3">
                <Users size={16} className="text-muted-foreground/60" strokeWidth={1.5} />
                Students Reached
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.studentCount}
                onChange={(e) => setFormData({...formData, studentCount: parseInt(e.target.value) || 0})}
                className="h-12 w-full rounded-xl border border-border/80 bg-card text-foreground px-4 text-[15px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Why — Notes */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-foreground flex items-center gap-3">
                <FileText size={16} className="text-muted-foreground/60" strokeWidth={1.5} />
                Why this happened
              </label>
              <textarea
                value={formData.sharedNotes}
                onChange={(e) => setFormData({...formData, sharedNotes: e.target.value})}
                placeholder="Describe the purpose, outcome, and any key details about this interaction..."
                rows={4}
                className="w-full rounded-xl border border-border/80 bg-card text-foreground px-4 py-3.5 text-[15px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Follow-up */}
            <div className="rounded-xl border border-border/60 p-5 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`lmc-checkbox ${
                  formData.needsFollowup ? 'lmc-checkbox--checked' : 'lmc-checkbox--unchecked'
                }`}>
                  {formData.needsFollowup && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={formData.needsFollowup}
                  onChange={(e) => setFormData({...formData, needsFollowup: e.target.checked})}
                  className="sr-only"
                />
                <span className="text-[15px] font-bold text-foreground">Needs follow-up</span>
                <AlertCircle size={16} className="text-warning/70" strokeWidth={1.5} />
              </label>

              {formData.needsFollowup && (
                <div className="space-y-2 pl-9">
                  <label className="text-sm font-semibold text-muted-foreground">Follow-up due date</label>
                  <input
                    type="date"
                    value={formData.followupDueDate}
                    onChange={(e) => setFormData({...formData, followupDueDate: e.target.value})}
                    className="h-12 w-full rounded-xl border border-border/80 bg-card text-foreground px-4 text-[15px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                fullWidth
                size="lg"
              >
                <Save size={16} strokeWidth={2} className="mr-1.5" />
                {loading ? 'Saving to activity log...' : 'Log Interaction'}
              </Button>
              <Button
                type="button"
                onClick={() => router.back()}
                variant="secondary"
                size="lg"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground/40 text-center pt-1">
              This interaction will be recorded in the activity log for audit trail.
            </p>
          </form>
        </div>
    </div>
  );
}
