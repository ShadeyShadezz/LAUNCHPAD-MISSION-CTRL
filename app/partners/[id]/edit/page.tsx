'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button, buttonVariants } from '@/app/components/Button';

interface Contact {
  id?: string;
  name: string;
  email: string;
  title: string;
  contactType: 'LEADERSHIP' | 'PRIMARY' | 'SECONDARY';
}

interface Partner {
  id: string;
  organizationName: string;
  websiteUrl: string;
  schoolType: string;
  contacts: Contact[];
}

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<Partner | null>(null);

  const [newContact, setNewContact] = useState<Contact>({
    name: '',
    email: '',
    title: '',
    contactType: 'PRIMARY',
  });

  useEffect(() => {
    fetchPartner();
  }, [partnerId]);

  const fetchPartner = async () => {
    try {
      const res = await fetch(`/api/partners/${partnerId}`);
      if (res.ok) {
        const partner = await res.json();
        setFormData(partner);
      } else {
        console.error('Failed to fetch partner');
      }
    } catch (error) {
      console.error('Error fetching partner:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);

    try {
      const partnerData = {
        organizationName: formData.organizationName,
        websiteUrl: formData.websiteUrl,
        schoolType: formData.schoolType,
        contacts: formData.contacts.map(contact => ({
          name: contact.name,
          email: contact.email,
          title: contact.title,
          contactType: contact.contactType,
        })),
      };

      const res = await fetch(`/api/partners/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {}),
        },
        body: JSON.stringify(partnerData),
      });

      if (res.ok) {
        router.push('/partners');
      } else {
        console.error('Failed to update partner');
      }
    } catch (error) {
      console.error('Error updating partner:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    if (!formData || !newContact.name || !newContact.email) return;

    setFormData(prev => prev ? {
      ...prev,
      contacts: [...prev.contacts, newContact],
    } : null);

    setNewContact({
      name: '',
      email: '',
      title: '',
      contactType: 'PRIMARY',
    });
  };

  const removeContact = (index: number) => {
    if (!formData) return;

    setFormData(prev => prev ? {
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    } : null);
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Partner Not Found</h1>
          <p className="text-muted-foreground mb-4">The partner you're looking for doesn't exist.</p>
          <Link
            href="/partners"
            className="lmc-btn-inline gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <ArrowLeft size={16} />
            Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lmc-page bg-background">
      <div className="lmc-page-inner max-w-2xl">
        <div className="lmc-page-header lmc-form-page-header">
          <Link
            href="/partners"
            className="lmc-back-link inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Partners
          </Link>
          <h1 className="lmc-page-title">Edit Partner</h1>
          <p className="mt-2 text-muted-foreground">Update partner information and contacts.</p>
        </div>

        <form onSubmit={handleSubmit} className="lmc-partner-form space-y-8">
          <div className="lmc-surface lmc-form-section p-6 space-y-6">
            <h2 className="text-base md:text-lg font-bold text-foreground">Organization Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-foreground mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  id="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, organizationName: e.target.value } : null)}
                  className="lmc-input text-sm"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-foreground mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, websiteUrl: e.target.value } : null)}
                  className="lmc-input text-sm"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="schoolType" className="block text-sm font-medium text-foreground mb-2">
                  School Type
                </label>
                <select
                  id="schoolType"
                  value={formData.schoolType}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, schoolType: e.target.value } : null)}
                  className="lmc-input text-sm"
                >
                  <option value="">Select school type</option>
                  <option value="High School">High School</option>
                  <option value="Vocational">Vocational</option>
                  <option value="Community College">Community College</option>
                  <option value="University">University</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lmc-surface lmc-form-section p-6 space-y-6">
            <h2 className="text-base md:text-lg font-bold text-foreground">Contacts</h2>

            {formData.contacts.length > 0 && (
              <div className="lmc-contact-list space-y-3">
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="lmc-contact-row flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email} • {contact.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="lmc-contact-editor border-t border-border pt-6 space-y-4">
              <h3 className="text-base md:text-lg font-bold text-foreground">Add Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className="lmc-input text-sm"
                    placeholder="Contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    className="lmc-input text-sm"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <input
                    type="text"
                    value={newContact.title}
                    onChange={(e) => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                    className="lmc-input text-sm"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Type</label>
                  <select
                    value={newContact.contactType}
                    onChange={(e) => setNewContact(prev => ({ ...prev, contactType: e.target.value as Contact['contactType'] }))}
                    className="lmc-input text-sm"
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="LEADERSHIP">Leadership</option>
                    <option value="SECONDARY">Secondary</option>
                  </select>
                </div>
              </div>

              <Button
                type="button"
                onClick={addContact}
                disabled={!newContact.name || !newContact.email}
                variant="outline"
                icon={<Plus size={16} />}
              >
                Add Contact
              </Button>
            </div>
          </div>

          <div className="lmc-form-actions flex gap-4">
            <Button
              type="submit"
              disabled={loading || !formData.organizationName}
              className="flex-1"
            >
              {loading ? 'Updating Partner...' : 'Update Partner'}
            </Button>
            <Link href="/partners" className={`${buttonVariants({ variant: 'secondary', size: 'md' })} lmc-cancel-link`}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
