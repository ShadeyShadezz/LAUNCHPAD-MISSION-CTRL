'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, FileText, Save, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/Button';

interface Partner {
  id: string;
  organizationName: string;
}

const interactionTypes = [
  { value: 'INFOSESSION', label: 'Infosession' },
  { value: 'TABLING', label: 'Tabling' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'OUTREACH', label: 'Outreach' },
  { value: 'INTERVIEWS', label: 'Interviews' },
  { value: 'STUDENT_APPLICATION', label: 'Student Application' },
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Log New Interaction</h1>
            <p className="text-muted-foreground">Record outreach activity and engagement details.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partner Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users size={16} />
              Partner *
            </label>
            <select
              required
              value={formData.partnerId}
              onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <label className="text-sm font-medium text-foreground">Interaction Type *</label>
            <select
              required
              value={formData.interactionType}
              onChange={(e) => setFormData({...formData, interactionType: e.target.value})}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {interactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar size={16} />
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Student Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Number of Students</label>
            <input
              type="number"
              min="0"
              value={formData.studentCount}
              onChange={(e) => setFormData({...formData, studentCount: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText size={16} />
              Shared Notes
            </label>
            <textarea
              value={formData.sharedNotes}
              onChange={(e) => setFormData({...formData, sharedNotes: e.target.value})}
              placeholder="Add any relevant notes about this interaction..."
              rows={4}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Follow-up */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.needsFollowup}
                onChange={(e) => setFormData({...formData, needsFollowup: e.target.checked})}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">Needs Follow-up</span>
            </label>

            {formData.needsFollowup && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Follow-up Due Date</label>
                <input
                  type="date"
                  value={formData.followupDueDate}
                  onChange={(e) => setFormData({...formData, followupDueDate: e.target.value})}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Saving...' : 'Save Interaction'}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}