"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Partner {
  id: string;
  organizationName: string;
  contacts: Array<{
    name: string;
    email: string;
    contactType: string;
  }>;
}

export default function GmailIntegration() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const partnerId = searchParams.get('partnerId');

  useEffect(() => {
    fetchPartners();
    if (partnerId) {
      setSelectedPartnerId(partnerId);
      fetchPartner(partnerId);
    }
  }, [partnerId]);

  const fetchPartners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/partners');
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners([]);
    }
  };

  const fetchPartner = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/partners/${id}`);
      const data = await res.json();
      setPartner(data);
    } catch (error) {
      console.error('Error fetching partner:', error);
    }
  };

  const generateEmail = async () => {
    if (!selectedPartnerId || !userPrompt) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt, partnerId: selectedPartnerId }),
      });
      const { email } = await res.json();
      setGeneratedEmail(email);
    } catch (error) {
      alert('Error generating email');
    }
    setLoading(false);
  };

  const saveDraft = async () => {
    if (!generatedEmail || !selectedPartnerId) return;
    try {
      await fetch('http://localhost:5000/api/email-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: 'temp-staff-id', // Replace with auth
          partnerId: selectedPartnerId,
          contactEmail: partner?.contacts[0]?.email || '',
          subject: generatedEmail.split('\n')[0] || '',
          body: generatedEmail,
        }),
      });
      alert('Draft saved');
    } catch (error) {
      alert('Error saving draft');
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert('Copied to clipboard');
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <a href="/partners" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Partners</a>
        <h1 className="text-3xl font-bold">Gmail Integration - AI Email Generator</h1>
        <p className="text-gray-600 mt-2">Select partner, enter prompt, generate editable email draft.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Select Partner</label>
          <select 
            value={selectedPartnerId} 
            onChange={(e) => {
              setSelectedPartnerId(e.target.value);
              if (e.target.value) fetchPartner(e.target.value);
            }} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose partner...</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>{p.organizationName}</option>
            ))}
          </select>
        </div>
      </div>

      {partner && (
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="font-semibold">{partner.organizationName}</h3>
          <p>Contacts: {partner.contacts.map(c => c.name + ' (' + c.email + ')').join(', ')}</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <label className="block text-sm font-medium">Your Prompt / Message Goal</label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="e.g., Follow up on infosession, propose next meeting for 10 students..."
          className="w-full p-3 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      <button
        onClick={generateEmail}
        disabled={loading || !selectedPartnerId || !userPrompt}
        className="bg-green-600 text-white px-8 py-3 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition mb-6"
      >
        {loading ? 'Generating...' : 'Generate Email Draft'}
      </button>

      {generatedEmail && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">Generated Email (Editable)</label>
          <textarea
            value={generatedEmail}
            onChange={(e) => setGeneratedEmail(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-md h-96 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Email will appear here..."
          />
          <div className="flex gap-4">
            <button onClick={copyEmail} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Copy to Clipboard
            </button>
            <button onClick={saveDraft} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition">
              Save Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
