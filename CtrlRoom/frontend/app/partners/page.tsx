'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Edit2, TrendingUp, Trash2, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/Button';

interface Partner {
  id: string;
  organizationName: string;
  schoolType?: string | null;
  websiteUrl?: string | null;
  partnerStatus?: string | null;
  courseNumber?: number | null;
  earlyReleaseForSeniors: boolean;
  contacts: Array<{ id: string; name: string; email: string; title?: string | null }>;
}

export default function PartnersPage() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    schoolType: '',
    websiteUrl: '',
    courseNumber: '',
    earlyReleaseForSeniors: false,
    contacts: [{ name: '', email: '', title: '' }],
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await api.getPartners();
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      if (editingId) {
        await api.updatePartner(editingId, {
          organizationName: formData.organizationName,
          schoolType: formData.schoolType,
          websiteUrl: formData.websiteUrl,
          courseNumber: formData.courseNumber ? parseInt(formData.courseNumber) : null,
          earlyReleaseForSeniors: formData.earlyReleaseForSeniors,
          contacts: formData.contacts,
        });
      } else {
        await api.createPartner({
          organizationName: formData.organizationName,
          schoolType: formData.schoolType,
          websiteUrl: formData.websiteUrl,
          courseNumber: formData.courseNumber ? parseInt(formData.courseNumber) : null,
          earlyReleaseForSeniors: formData.earlyReleaseForSeniors,
          createdById: user.id,
          contacts: { create: formData.contacts },
        });
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      await fetchPartners();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      organizationName: '',
      schoolType: '',
      websiteUrl: '',
      courseNumber: '',
      earlyReleaseForSeniors: false,
      contacts: [{ name: '', email: '', title: '' }],
    });
  };

  const handleEdit = (partner: Partner) => {
    setFormData({
      organizationName: partner.organizationName,
      schoolType: partner.schoolType || '',
      websiteUrl: partner.websiteUrl || '',
      courseNumber: partner.courseNumber?.toString() || '',
      earlyReleaseForSeniors: partner.earlyReleaseForSeniors,
      contacts: partner.contacts.map(c => ({
        name: c.name,
        email: c.email,
        title: c.title || '',
      })),
    });
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner?')) return;
    try {
      await api.deletePartner(id);
      await fetchPartners();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredPartners = partners.filter(p =>
    p.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contacts.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Partners Directory</h1>
            <p className="mt-1 text-muted-foreground">Manage school and organizational partnerships.</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowForm(!showForm);
            }}
            className={showForm ? 'bg-slate-600 hover:bg-slate-700' : 'bg-cyan-500 hover:bg-cyan-600'}
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Partner'}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tech Academy High School"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">School Type</label>
                  <input
                    type="text"
                    placeholder="High School / Vocational"
                    value={formData.schoolType}
                    onChange={(e) => setFormData({...formData, schoolType: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Course Number</label>
                  <input
                    type="number"
                    placeholder="101"
                    value={formData.courseNumber}
                    onChange={(e) => setFormData({...formData, courseNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="earlyRelease"
                  checked={formData.earlyReleaseForSeniors}
                  onChange={(e) => setFormData({...formData, earlyReleaseForSeniors: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="earlyRelease" className="text-sm font-medium text-foreground">
                  Early Release Program for Seniors
                </label>
              </div>

              {/* Contacts */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Primary Contact</label>
                {formData.contacts.map((contact, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Contact name"
                      value={contact.name}
                      onChange={(e) => {
                        const updated = [...formData.contacts];
                        updated[idx].name = e.target.value;
                        setFormData({...formData, contacts: updated});
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="email"
                      placeholder="contact@example.com"
                      value={contact.email}
                      onChange={(e) => {
                        const updated = [...formData.contacts];
                        updated[idx].email = e.target.value;
                        setFormData({...formData, contacts: updated});
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={contact.title}
                      onChange={(e) => {
                        const updated = [...formData.contacts];
                        updated[idx].title = e.target.value;
                        setFormData({...formData, contacts: updated});
                      }}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  {editingId ? 'Update Partner' : 'Add Partner'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search partners by name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Partners Grid */}
        <div className="grid gap-4">
          {filteredPartners.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No partners found</p>
            </div>
          ) : (
            filteredPartners.map((partner) => (
              <div key={partner.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{partner.organizationName}</h3>
                    {partner.schoolType && (
                      <p className="text-sm text-muted-foreground mt-1">{partner.schoolType}</p>
                    )}
                    {partner.contacts.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {partner.contacts.map((contact) => (
                          <div key={contact.id} className="text-sm">
                            <p className="font-medium text-foreground">{contact.name}</p>
                            <p className="text-muted-foreground">{contact.title || 'Contact'} • {contact.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {partner.contacts[0]?.email && (
                      <Link href={`/email?partnerId=${partner.id}`}>
                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                          <Mail size={16} />
                          Email
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={() => handleEdit(partner)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-foreground rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

