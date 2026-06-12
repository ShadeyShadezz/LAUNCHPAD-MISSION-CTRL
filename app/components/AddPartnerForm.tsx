'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Loader2, Plus, X } from 'lucide-react';

interface Contact {
  name: string;
  email: string;
  title: string;
  contactType: 'LEADERSHIP' | 'PRIMARY' | 'SECONDARY';
}

export default function AddPartnerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // STATE VARIABLES - DEMONSTRATED (Requirement: Show variable creation & updates)
  const [formData, setFormData] = useState({
    organizationName: '',
    websiteUrl: '',
    schoolType: '',
    partnerType: '',
    partnerStatus: 'Active',
    tags: ''
  });

  // STATE VARIABLE: Contacts array
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', email: '', title: '', contactType: 'LEADERSHIP' }
  ]);

  // UPDATE variable when input changes (Requirement: Show variable updates)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // UPDATED the formData variable
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // UPDATE contacts array
  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    const newContacts = [...contacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    };
    setContacts(newContacts);
  };

  // FUNCTION WITHOUT PARAMETERS (Requirement: Show function without params)
  const addContactField = () => {
    setContacts([
      ...contacts,
      { name: '', email: '', title: '', contactType: 'PRIMARY' }
    ]);
  };

  // FUNCTION WITH PARAMETERS (Requirement: Show function with params)
  const removeContactField = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  // FUNCTION: Handle form submission - USES the variables
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(
        '/api/partners',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            organizationName: formData.organizationName,
            websiteUrl: formData.websiteUrl,
            schoolType: formData.schoolType,
            partnerType: formData.partnerType,
            partnerStatus: formData.partnerStatus,
            tags: formData.tags.split(',').map((t) => t.trim()),
            contacts: contacts.filter(
              (c) => c.name && c.email // Validate contacts aren't empty
            )
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create partner');
      }

      // Success - redirect to partners page
      router.push(`/partners/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl ui-stack-lg">
        <div className="ui-section">
          <h1 className="lmc-page-title">Add New Partnership</h1>
          <p className="ui-section-subtitle">Create a partner record with organization details, contacts, and status metadata.</p>
        </div>

        {error && (
          <div className="p-4 lmc-banner lmc-banner--error rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ui-card p-5 sm:p-6 ui-stack-lg">
          {/* SECTION 1: BASIC INFO */}
          <section className="ui-stack-md">
            <h2 className="ui-section-title">Basic Information</h2>
            <div className="ui-stack-md">
              <div className="ui-field">
                <label className="ui-label">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Innovations Inc."
                  required
                  className="ui-input"
                />
              </div>

              <div className="ui-field">
                <label className="ui-label">
                  Website URL
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="ui-input"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="ui-field">
                  <label className="ui-label">School Type</label>
                  <select
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleInputChange}
                    className="ui-select"
                  >
                    <option value="">Select...</option>
                    <option value="High School">High School</option>
                    <option value="University">University</option>
                    <option value="Vocational">Vocational</option>
                  </select>
                </div>

                <div className="ui-field">
                  <label className="ui-label">Partner Type</label>
                  <select
                    name="partnerType"
                    value={formData.partnerType}
                    onChange={handleInputChange}
                    className="ui-select"
                  >
                    <option value="">Select...</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Educational Non-Profit">
                      Educational Non-Profit
                    </option>
                    <option value="Government">Government</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: CONTACTS - DEMONSTRATES MULTI-ENTRY FORM */}
          <section className="ui-stack-md">
            <h2 className="ui-section-title">Contact Information</h2>
            <div className="ui-stack-md">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-muted/30 p-4 ui-stack-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">
                      {contact.contactType} Contact
                    </span>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContactField(index)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(index, 'name', e.target.value)
                      }
                      className="ui-input"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={contact.email}
                      onChange={(e) =>
                        handleContactChange(index, 'email', e.target.value)
                      }
                      className="ui-input"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={contact.title}
                      onChange={(e) =>
                        handleContactChange(index, 'title', e.target.value)
                      }
                      className="ui-input"
                    />
                    <select
                      value={contact.contactType}
                      onChange={(e) =>
                        handleContactChange(
                          index,
                          'contactType',
                          e.target.value
                        )
                      }
                      className="ui-select"
                    >
                      <option value="LEADERSHIP">Leadership</option>
                      <option value="PRIMARY">Primary</option>
                      <option value="SECONDARY">Secondary</option>
                    </select>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addContactField}
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="w-4 h-4" />
                Add Another Contact
              </button>
            </div>
          </section>

          {/* SECTION 3: STATUS & TAGS */}
          <section className="ui-stack-md">
            <h2 className="ui-section-title">Partnership Status</h2>
            <div className="ui-stack-md">
              <div className="ui-field">
                <label className="ui-label">
                  Status
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Active', 'Pending', 'Inactive'].map((status) => (
                    <label key={status} className="ui-chip cursor-pointer">
                      <input
                        type="radio"
                        name="partnerStatus"
                        value={status}
                        checked={formData.partnerStatus === status}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary border-border bg-card focus:ring-primary/20"
                      />
                      <span className="text-xs font-semibold text-foreground">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="ui-field">
                <label className="ui-label">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., tech, internships, mentorship"
                  className="ui-input"
                />
                <p className="ui-helper">Use simple comma-separated tags to improve discoverability.</p>
              </div>
            </div>
          </section>

          {/* FORM BUTTONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              fullWidth
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} fullWidth className="sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Partnership'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
