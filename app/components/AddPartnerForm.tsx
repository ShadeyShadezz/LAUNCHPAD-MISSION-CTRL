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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Partnership</h1>

        {error && (
          <div className="mb-6 p-4 lmc-banner lmc-banner--error rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-lg border">
          {/* SECTION 1: BASIC INFO */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Innovations Inc."
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  School Type
                </label>
                  <select
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    <option value="High School">High School</option>
                    <option value="University">University</option>
                    <option value="Vocational">Vocational</option>
                  </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Partner Type
                </label>
                  <select
                    name="partnerType"
                    value={formData.partnerType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
          </div>

          {/* SECTION 2: CONTACTS - DEMONSTRATES MULTI-ENTRY FORM */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 bg-muted/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
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

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(index, 'name', e.target.value)
                      }
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={contact.email}
                      onChange={(e) =>
                        handleContactChange(index, 'email', e.target.value)
                      }
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={contact.title}
                      onChange={(e) =>
                        handleContactChange(index, 'title', e.target.value)
                      }
                      className="px-3 py-2 border rounded-lg text-sm"
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
                      className="px-3 py-2 border rounded-lg text-sm"
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
                className="flex items-center gap-3 text-primary hover:text-primary/80 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Another Contact
              </button>
            </div>
          </div>

          {/* SECTION 3: STATUS & TAGS */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Partnership Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  {['Active', 'Pending', 'Inactive'].map((status) => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="partnerStatus"
                        value={status}
                        checked={formData.partnerStatus === status}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary border-border bg-card focus:ring-primary/20"
                      />
                      <span className="text-sm text-foreground">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., tech, internships, mentorship"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* FORM BUTTONS */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
