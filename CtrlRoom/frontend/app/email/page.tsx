'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Mail, Send, Save, Eye, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

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
      const res = await fetch('http://localhost:5000/api/partners');
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
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
      const res = await fetch('http://localhost:5000/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: aiPrompt, partnerId: selectedPartnerId }),
      });
      if (res.ok) {
        const { email } = await res.json();
        const subjectMatch = email.match(/Subject: (.*)/i);
        const bodyMatch = email.replace(/Subject: .*/i, '').trim();
        
        if (subjectMatch) setSubject(subjectMatch[1]);
        setBody(bodyMatch);
        setMessage({ type: 'success', text: 'AI Draft generated' });
      } else {
        throw new Error('AI generation failed');
      }
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
      const res = await fetch('http://localhost:5000/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text: body }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Email sent successfully!' });
        setTo('');
        setSubject('');
        setBody('');
        localStorage.removeItem('email_draft');
      } else {
        setMessage({ type: 'error', text: 'Failed to send email.' });
      }
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">Email Terminal</h1>
            <p className="text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <Mail size={14} className="text-primary" />
              Strategic Communication Interface
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={clsx(
            'flex items-center gap-4 px-6 py-4 rounded-2xl border text-sm font-black uppercase tracking-wider animate-in fade-in zoom-in-95 duration-300',
            message.type === 'success'
              ? 'bg-success/5 border-success/20 text-success'
              : 'bg-destructive/5 border-destructive/20 text-destructive'
          )}>
            {message.type === 'success' ? <CheckCircle size={20} strokeWidth={3} /> : <AlertCircle size={20} strokeWidth={3} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Intelligence Settings */}
          <aside className="space-y-8">
            <div className="bg-card border border-border rounded-[32px] p-8 shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3 italic">
                <div className="w-8 h-px bg-border" />
                Intelligence Input
              </h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Target Partner</label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => handlePartnerSelect(e.target.value)}
                    className="w-full px-4 py-3.5 bg-muted/30 border border-border rounded-2xl text-sm text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="">CHOOSE RECIPIENT...</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.organizationName.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Communication Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3.5 bg-muted/30 border border-border rounded-2xl text-sm text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="professional">WARM & PROFESSIONAL</option>
                    <option value="formal">STRICT & FORMAL</option>
                    <option value="casual">CASUAL & FRIENDLY</option>
                    <option value="enthusiastic">ENTHUSIASTIC & DRIVEN</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <AlertCircle size={12} className="text-primary" />
                    AI Mission Objectives
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.G., FOLLOW UP ON INFOSESSION, PROPOSE NEXT MEETING..."
                    className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl h-32 text-xs text-foreground font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="w-full px-6 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {aiLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><RotateCcw size={16} strokeWidth={3} /> Process Intelligence</>
                  )}
                </button>
              </div>
            </div>

            {/* Tactical Variables */}
            <div className="bg-card border border-border rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 italic">Tactical Variables</h3>
              <div className="flex flex-wrap gap-3">
                {insertableVariables.map((v) => (
                  <button
                    key={v}
                    onClick={() => setBody((b) => b + `{{${v}}}`)}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-muted/50 text-foreground rounded-xl border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Communication Hub */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-[32px] p-10 shadow-2xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Transmission Recipient</label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="RECIPIENT@MISSION.ORG"
                    className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-sm text-foreground font-black placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Mission Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="STRATEGIC FOLLOW-UP..."
                    className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-sm text-foreground font-black placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Message Intel</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="START TRANSMISSION..."
                  rows={12}
                  className="w-full px-8 py-8 bg-muted/30 border border-border rounded-[32px] text-sm text-foreground font-bold resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Strategic Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
              <button
                onClick={() => setShowPreview((p) => !p)}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-card border border-border text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all active:scale-95 shadow-lg"
              >
                <Eye size={16} strokeWidth={3} /> {showPreview ? 'Hide Intel' : 'Analyze Draft'}
              </button>
              <button
                onClick={() => setMessage({ type: 'success', text: 'Intel saved to localStorage' })}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-card border border-border text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all active:scale-95 shadow-lg"
              >
                <Save size={16} strokeWidth={3} /> Save Intel
              </button>
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-card border border-border text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white transition-all active:scale-95 shadow-lg"
              >
                <RotateCcw size={16} strokeWidth={3} /> Purge Input
              </button>
              <button
                onClick={handleSendEmail}
                disabled={loading}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : <><Send size={16} strokeWidth={3} /> Launch Intel</>}
              </button>
            </div>

            {/* Intelligence Preview Overlay */}
            {showPreview && (
              <div className="bg-card border border-border rounded-[32px] p-10 space-y-6 animate-in slide-in-from-bottom-10 duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <div className="px-3 py-1 rounded-full bg-success/10 text-success text-[8px] font-black uppercase tracking-[0.2em] border border-success/20">Ready for Deployment</div>
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3 italic">
                  <Eye size={14} className="text-primary" />
                  Mission Preview
                </h3>
                <div className="bg-muted/30 border border-border rounded-[24px] p-10 space-y-6 text-sm font-bold shadow-inner relative">
                  <div className="space-y-4 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-4"><span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest w-20">Transmission:</span> <span className="text-foreground">{to || 'NO TARGET SPECIFIED'}</span></div>
                    <div className="flex items-center gap-4"><span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest w-20">Subject:</span> <span className="text-primary italic uppercase">{subject || 'UNSPECIFIED MISSION'}</span></div>
                  </div>
                  <div className="pt-4 whitespace-pre-wrap text-foreground leading-loose italic">{body || 'AWAITING MISSION INTEL...'}</div>
                  <div className="absolute bottom-6 right-8 text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] italic">Encrypted Secure Line</div>
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
