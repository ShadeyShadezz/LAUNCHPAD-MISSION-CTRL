'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface Contact {
  name: string;
  email: string;
  title: string;
  contactType: 'LEADERSHIP' | 'PRIMARY' | 'SECONDARY';
}

export default function NewPartnerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    websiteUrl: '',
    schoolType: '',
    contacts: [] as Contact[],
  });

  const [newContact, setNewContact] = useState<Contact>({
    name: '',
    email: '',
    title: '',
    contactType: 'PRIMARY',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const partnerData = {
        ...formData,
        createdById: user.id,
        contacts: formData.contacts.map(contact => ({
          ...contact,
          contactType: contact.contactType as 'LEADERSHIP' | 'PRIMARY' | 'SECONDARY',
        })),
      };

      const res = await fetch('http://localhost:5000/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerData),
      });

      if (res.ok) {
        router.push('/partners');
      } else {
        console.error('Failed to create partner');
        alert('Failed to create partner. Please try again.');
      }
    } catch (error) {
      console.error('Error creating partner:', error);
      alert(error instanceof Error ? error.message : 'Failed to create partner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.email && formData.contacts.length < 3) {
      setFormData(prev => ({
        ...prev,
        contacts: [...prev.contacts, newContact],
      }));
      setNewContact({
        name: '',
        email: '',
        title: '',
        contactType: 'PRIMARY',
      });
    }
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="mb-8">
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Partners
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Partner</h1>
          <p className="mt-2 text-muted-foreground">Add a new partner organization to your directory.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Organization Details</h2>

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
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolType: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Contacts</h2>

            {formData.contacts.length > 0 && (
              <div className="space-y-3">
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
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

            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-lg font-medium text-foreground">Add Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <input
                    type="text"
                    value={newContact.title}
                    onChange={(e) => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Type</label>
                  <select
                    value={newContact.contactType}
                    onChange={(e) => setNewContact(prev => ({ ...prev, contactType: e.target.value as Contact['contactType'] }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="LEADERSHIP">Leadership</option>
                    <option value="SECONDARY">Secondary</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={addContact}
                disabled={!newContact.name || !newContact.email || formData.contacts.length >= 3}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Add Contact {formData.contacts.length >= 3 ? '(Max 3 reached)' : ''}
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.organizationName}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Partner...' : 'Create Partner'}
            </button>
            <Link
              href="/partners"
              className="px-6 py-3 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}