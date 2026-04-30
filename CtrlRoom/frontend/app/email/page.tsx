'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Mail, Send, Save, Eye, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';

interface Partner {
  id: string;
  organizationName: string;
  contacts: Array<{
    name: string;
    email: string;
  }>;
}

const EmailComposerPage = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState('professional');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const insertableVariables = [
    'PartnerName',
    'Primary Contact',
    'Staff Name',
    'Interaction Date',
    'Student Count',
  ];

  useEffect(() => {
    fetchPartners();
    // Load from localStorage
    const savedDraft = localStorage.getItem('email_draft');
    if (savedDraft) {
      const { to, subject, body, selectedPartnerId, tone, aiPrompt } = JSON.parse(savedDraft);
      if (to) setTo(to);
      if (subject) setSubject(subject);
      if (body) setBody(body);
      if (selectedPartnerId) setSelectedPartnerId(selectedPartnerId);
      if (tone) setTone(tone);
      if (aiPrompt) setAiPrompt(aiPrompt);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    const draft = { to, subject, body, selectedPartnerId, tone, aiPrompt };
    localStorage.setItem('email_draft', JSON.stringify(draft));
  }, [to, subject, body, selectedPartnerId, tone, aiPrompt]);

  const fetchPartners = async () => {
    try {
      const data = await api.getPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedPartnerId || !aiPrompt) {
      setMessage({ type: 'error', text: 'Select a partner and provide a prompt for AI' });
      return;
    }
    setAiLoading(true);
    setMessage(null);
    try {
      const { email } = await api.generateEmail({ userPrompt: aiPrompt, partnerId: selectedPartnerId });
      const subjectMatch = email.match(/Subject: (.*)/i);
      const bodyMatch = email.replace(/Subject: .*/i, '').trim();

      if (subjectMatch) setSubject(subjectMatch[1]);
      setBody(bodyMatch);
      setMessage({ type: 'success', text: 'AI Draft generated' });
    } catch (error) {
      setMessage({ type: 'error', text: 'AI Generation failed. Check API key.' });
    }
    setAiLoading(false);
  };

  const handleSendEmail = async () => {
    if (!to || !subject || !body) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.sendEmail({ to, subject, text: body });
      setMessage({ type: 'success', text: 'Email sent successfully!' });
      setTo('');
      setSubject('');
      setBody('');
      localStorage.removeItem('email_draft');
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error' });
    }
    setLoading(false);
  };

  const handlePartnerSelect = (id: string) => {
    setSelectedPartnerId(id);
    const partner = partners.find(p => p.id === id);
    if (partner && partner.contacts.length > 0) {
      setTo(partner.contacts[0].email);
    }
  };

  const handleClear = () => {
    setTo('');
    setSubject('');
    setBody('');
    setMessage(null);
    setSelectedPartnerId('');
    setAiPrompt('');
    localStorage.removeItem('email_draft');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Email Terminal</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail size={14} className="text-primary" />
              Strategic Communication Interface
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium animate-in fade-in zoom-in-95 duration-300',
            message.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          )}>
            {message.type === 'success' ? <CheckCircle size={18} strokeWidth={2} /> : <AlertCircle size={18} strokeWidth={2} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intelligence Settings */}
          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-5 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <h2 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                <div className="w-6 h-px bg-border" />
                Email Settings
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Select Partner</label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => handlePartnerSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose a recipient...</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.organizationName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="professional">Professional</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-2">
                    <AlertCircle size={12} className="text-primary" />
                    AI Prompt
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., follow up on info session, propose next meeting..."
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg h-24 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="w-full px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-sm hover:shadow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><RotateCcw size={14} strokeWidth={2} /> Generate with AI</>
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* Communication Hub */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Recipient Email</label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Email Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">Message Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message here..."
                  rows={10}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Strategic Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setShowPreview((p) => !p)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:bg-muted transition-all active:scale-95"
              >
                <Eye size={14} strokeWidth={2} /> {showPreview ? 'Hide' : 'Preview'}
              </button>
              <button
                onClick={() => setMessage({ type: 'success', text: 'Draft saved' })}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:bg-muted transition-all active:scale-95"
              >
                <Save size={14} strokeWidth={2} /> Save
              </button>
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-card border border-border text-xs font-medium text-destructive hover:bg-destructive/10 transition-all active:scale-95"
              >
                <RotateCcw size={14} strokeWidth={2} /> Clear
              </button>
              <button
                onClick={handleSendEmail}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-white text-xs font-medium shadow-sm hover:shadow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Sending...' : <><Send size={14} strokeWidth={2} /> Send</>}
              </button>
            </div>

            {/* Intelligence Preview Overlay */}
            {showPreview && (
              <div className="bg-card border border-border rounded-lg p-5 space-y-4 animate-in slide-in-from-bottom-10 duration-500 shadow-md relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">Ready</div>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Eye size={14} className="text-primary" />
                  Preview
                </h3>
                <div className="bg-muted/20 border border-border rounded-lg p-6 space-y-4 text-sm shadow-inner relative">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3"><span className="text-xs font-medium text-muted-foreground w-16">To:</span> <span className="text-foreground break-all">{to || '(no recipient)'}</span></div>
                    <div className="flex items-start gap-3"><span className="text-xs font-medium text-muted-foreground w-16">Subject:</span> <span className="text-foreground">{subject || '(no subject)'}</span></div>
                  </div>
                  <div className="pt-3 border-t border-border/50 whitespace-pre-wrap text-foreground text-sm leading-relaxed">{body || '(message body)'}</div>
                  <div className="text-xs text-muted-foreground/40 pt-2">Secure message preview</div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmailComposerPage;
