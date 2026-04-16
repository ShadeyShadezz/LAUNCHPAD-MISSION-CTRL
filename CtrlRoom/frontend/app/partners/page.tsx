import { notFound } from 'next/navigation';

interface Partner {
  id: string;
  organizationName: string;
  schoolType: string;
  websiteUrl: string;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    contactType: string;
  }>;
}

async function getPartners() {
  try {
    const res = await fetch('http://localhost:5000/api/partners', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json() as Promise<Partner[]>;
  } catch {
    return [];
  }
}

"use client";

import { useState, useEffect } from 'react';

interface Partner {
  id: string;
  organizationName: string;
  schoolType: string;
  websiteUrl: string;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    contactType: string;
  }>;
}

interface NewPartnerForm {
  organizationName: string;
  websiteUrl: string;
  schoolType: string;
  contacts: Array<{
    name: string;
    email: string;
    contactType: string;
  }>;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<NewPartnerForm>({
    organizationName: '',
    websiteUrl: '',
    schoolType: '',
    contacts: [{ name: '', email: '', contactType: 'PRIMARY' }]
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/partners');
      if (!res.ok) return;
      const data = await res.json();
      setPartners(data);
    } catch {}
    setLoading(false);
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { name: '', email: '', contactType: 'PRIMARY' }]
    });
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = formData.contacts.map((c, i) => 
      i === index ? { ...c, [field]: value } : c
    );
    setFormData({ ...formData, contacts: newContacts });
  };

  const submitPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          websiteUrl: formData.websiteUrl,
          schoolType: formData.schoolType,
          createdById: 'temp-staff-id',
          contacts: formData.contacts
        }),
      });
      setShowForm(false);
      fetchPartners();
    } catch (error) {
      alert('Error adding partner');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Partners</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
        >
          {showForm ? 'Cancel' : 'Add Partner'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-6">Add New Partner</h2>
          <form onSubmit={submitPartner} className="space-y-4">
            <input
              placeholder="Organization Name"
              value={formData.organizationName}
              onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              placeholder="Website URL"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="School Type (e.g., High School)"
              value={formData.schoolType}
              onChange={(e) => setFormData({...formData, schoolType: e.target.value})}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <h3 className="font-medium mb-2">Contacts</h3>
              {formData.contacts.map((contact, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    placeholder="Email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <select
                    value={contact.contactType}
                    onChange={(e) => updateContact(index, 'contactType', e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option>PRIMARY</option>
                    <option>SECONDARY</option>
                    <option>LEADERSHIP</option>
                  </select>
                </div>
              ))}
              <button type="button" onClick={addContact} className="text-blue-600 hover:underline text-sm">
                + Add Contact
              </button>
            </div>
            <button type="submit" className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 font-medium">
              Create Partner
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {partner.organizationName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.schoolType || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a href={partner.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {partner.websiteUrl ? partner.websiteUrl.split('/')[2] : 'N/A'}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.contacts.length > 0 
                    ? partner.contacts.map(c => `${c.name} (${c.contactType})`).join(', ') 
                    : 'None'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a 
                    href={`/integrations/gmail?partnerId=${partner.id}`} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mr-2"
                  >
                    Generate Email
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

