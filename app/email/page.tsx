'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { clsx } from 'clsx';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { api, type ActiveOrganization } from '@/app/lib/api';

type Organization = ActiveOrganization;

const EmailComposerPage = () => {
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [emailPurpose, setEmailPurpose] = useState('Check-in');
  const [tone, setTone] = useState('professional');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const activeOrg = organizations.find((org) => org.id === selectedOrgId);
  const availableContacts = activeOrg?.contacts || [];
  const quickEmailData = useRef<{ partnerId: string; contactEmail: string; subject?: string } | null>(null);
  const generateRef = useRef<() => Promise<void>>();

  // Data loading and error state
  const [isDatabaseLoading, setIsDatabaseLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const loadData = async () => {
      setIsDatabaseLoading(true);
      setDbError(null);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/partners', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const partners = res.ok ? await res.json() : [];
        const mappedOrganizations: Organization[] = (Array.isArray(partners) ? partners : []).map((p: any) => ({
          id: p.id,
          partnerId: p.id,
          orgId: null,
          name: p.organizationName,
          tier: p.partnerType ?? null,
          status: p.partnerStatus || 'Unknown',
          statusNormalized: 'UNKNOWN',
          primaryContactName: (p.contacts || []).find((c: any) => c.contactType === 'PRIMARY')?.name || 'N/A',
          primaryContactEmail: (p.contacts || []).find((c: any) => c.contactType === 'PRIMARY')?.email || '',
          contacts: (p.contacts || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            contactType: c.contactType,
            title: c.title,
          })),
        }));
        setOrganizations(mappedOrganizations);

        const savedDraft = localStorage.getItem('email_draft');
        if (savedDraft) {
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(savedDraft);
          } catch {
            localStorage.removeItem('email_draft');
            return;
          }

          const {
            to: savedTo,
            subject: savedSubject,
            generatedEmail: savedGeneratedEmail,
            selectedRecipient: savedSelectedRecipient,
            tone: savedTone,
            customInstructions: savedCustomInstructions,
            selectedOrgId: savedOrgId,
            emailPurpose: savedPurpose,
          } = parsed as {
            to?: string;
            subject?: string;
            generatedEmail?: string;
            selectedRecipient?: string;
            tone?: string;
            customInstructions?: string;
            selectedOrgId?: string;
            emailPurpose?: string;
          };

          if (savedTo) setTo(savedTo);
          if (savedSubject) setSubject(savedSubject);
          if (savedGeneratedEmail) setGeneratedEmail(savedGeneratedEmail);
          if (savedSelectedRecipient) setSelectedRecipient(savedSelectedRecipient);
          if (savedTone) setTone(savedTone);
          if (savedCustomInstructions) setCustomInstructions(savedCustomInstructions);
          if (savedPurpose) setEmailPurpose(savedPurpose);

          if (savedOrgId) {
            setSelectedOrgId(savedOrgId);
          }
        }
      } catch {
        setOrganizations([]);
        setDbError('Failed to load organizations.');
      } finally {
        setIsDatabaseLoading(false);
      }
    };

    if (user) {
      loadData();
    }
    if (!user) {
      setIsDatabaseLoading(false);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('email_draft', JSON.stringify({
        to, subject, generatedEmail, selectedRecipient, tone,
        customInstructions, selectedOrgId, emailPurpose,
      }));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }, [to, subject, generatedEmail, selectedRecipient, tone, customInstructions, selectedOrgId, emailPurpose]);

  useEffect(() => {
    if (!user || organizations.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const partnerId = params.get('partnerId');
    const contactEmail = params.get('contactEmail');
    const subjectParam = params.get('subject');
    if (!partnerId || !contactEmail) return;

    quickEmailData.current = { partnerId, contactEmail, subject: subjectParam || undefined };

    const org = organizations.find((o) => o.partnerId === partnerId);
    if (org) {
      setSelectedOrgId(org.id);
      setSelectedRecipient(contactEmail);
      setTo(contactEmail);
      if (subjectParam) setSubject(subjectParam);
    }
  }, [user, organizations]);

  useEffect(() => {
    if (!quickEmailData.current || !activeOrg || !selectedRecipient) return;
    if (selectedRecipient !== quickEmailData.current.contactEmail) return;

    quickEmailData.current = null;
    const timer = setTimeout(() => generateRef.current?.(), 300);
    return () => clearTimeout(timer);
  }, [activeOrg, selectedRecipient]);

  const handleGenerateAIEmail = async () => {
    if (!activeOrg) {
      setMessage({ type: 'error', text: 'Select an organization first.' });
      return;
    }
    if (!selectedRecipient) {
      setMessage({ type: 'error', text: 'Select a recipient.' });
      return;
    }

    setIsGenerating(true);
    setMessage(null);
    setGeneratedEmail('');

    const selectedContact = availableContacts.find(c => c.email === selectedRecipient);

    try {
      const promptContext = {
        organizationName: activeOrg.name,
        tier: activeOrg.tier || 'Tier Not Set',
        primaryContact: selectedContact?.name || activeOrg.primaryContactName || 'N/A',
        purpose: emailPurpose,
      };

      const data = await api.generateEmail({
        partnerId: activeOrg.partnerId,
        customInstructions,
        tone,
        subject,
        recipientName: selectedContact?.name || '',
        recipientEmail: selectedRecipient,
        promptContext,
      });

      setGeneratedEmail(data.emailBody || data.text || '');
      if (data.subject) {
        setSubject(data.subject);
      }
      setMessage({ type: 'success', text: 'AI Draft generated' });
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'AI Generation failed. Check API key.';
      setMessage({ type: 'error', text: messageText });
    } finally {
      setIsGenerating(false);
    }
  };
  generateRef.current = handleGenerateAIEmail;

  const [isPending, startTransition] = useTransition();
  const handleSendEmail = () => {
    if (!to || !subject || !generatedEmail) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    setMessage(null);
    startTransition(async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ to, subject, text: generatedEmail, partnerId: activeOrg?.partnerId }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to send email');
        }
        setMessage({ type: 'success', text: 'Email sent successfully!' });
        setTo('');
        setSubject('');
        setGeneratedEmail('');
        localStorage.removeItem('email_draft');
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to send email.' });
      }
      setLoading(false);
    });
  };
  const handleCopy = () => {
    if (!generatedEmail) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedEmail).then(() => {
        setMessage({ type: 'success', text: 'Copied to clipboard!' });
      }).catch(() => fallbackCopy(generatedEmail));
    } else {
      fallbackCopy(generatedEmail);
    }
  };

  function fallbackCopy(text: string) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setMessage({ type: 'success', text: 'Copied to clipboard!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to copy. Select text manually.' });
    }
  }

  const handleRecipientSelect = (email: string) => {
    setSelectedRecipient(email);
    setTo(email);
  };

  const handleClear = () => {
    setTo('');
    setSubject('');
    setGeneratedEmail('');
    setMessage(null);
    setSelectedOrgId('');
    setEmailPurpose('Check-in');
    setCustomInstructions('');
    setSelectedRecipient('');
    localStorage.removeItem('email_draft');
  };

  function MissingBadge({ label }: { label: string }) {
    return <span className="missing-badge">{label}</span>;
  }

  // Safe Return Guard: Isolate auth/session from data loading
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="spinner-ring-lg" />
      </div>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-5xl">
        {dbError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive font-semibold">
            {dbError} <button type="button" className="ml-2 underline" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        <div className="lmc-page-header">
          <span className="lmc-kicker">Outreach Studio</span>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="lmc-page-title">Email Terminal</h1>
              <p className="lmc-page-subtitle inline-flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <span>Strategic Communication Interface</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="lmc-email-action-btn lmc-btn-inline px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            >
              Clear Draft
            </button>
          </div>
        </div>
        {message && (
          <div className={clsx(
            'lmc-banner',
            message.type === 'success'
              ? 'lmc-banner--success'
              : 'lmc-banner--error',
          )}>
            {message.type === 'success' ? <CheckCircle size={20} strokeWidth={3} /> : <AlertCircle size={20} strokeWidth={3} />}
            {message.text}
          </div>
        )}

        <div className="space-y-5">
        {/* 1. Partner Select */}
        <div className="rounded-xl bg-card border border-border p-5 md:p-6">
          <label className="block pb-1 tracking-wide font-bold text-sm text-muted-foreground uppercase" htmlFor="partner-select">Target Partner</label>
          <select
            id="partner-select"
            name="organizationId"
            value={selectedOrgId}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedOrgId(value);
              setSelectedRecipient('');
              if (!value) setTo('');
            }}
            disabled={isDatabaseLoading || !!dbError || organizations.length === 0}
            className="w-full min-h-[52px] rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {isDatabaseLoading ? (
              <option value="">Loading database records...</option>
            ) : dbError ? (
              <option value="">Error loading data</option>
            ) : organizations.length === 0 ? (
              <option value="">No organization records found</option>
            ) : (
              <>
                <option value="">CHOOSE ORGANIZATION...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.tier ? `(${org.tier})` : ''}
                  </option>
                ))}
              </>
            )}
          </select>
          {activeOrg && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Primary Contact: {activeOrg.primaryContactName || 'N/A'}
            </p>
          )}
        </div>

        {/* 2. Contact Select */}
        <div className="rounded-xl bg-card border border-border p-5 md:p-6">
          <label className="block pb-1 tracking-wide font-bold text-sm text-muted-foreground uppercase" htmlFor="recipient-select">Recipient</label>
          <select
            id="recipient-select"
            name="recipientEmail"
            value={selectedRecipient}
            onChange={(e) => handleRecipientSelect(e.target.value)}
            disabled={isDatabaseLoading || !!dbError || !selectedOrgId}
            className="w-full min-h-[52px] rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {isDatabaseLoading ? (
              <option value="">Loading database records...</option>
            ) : dbError ? (
              <option value="">Error loading data</option>
            ) : !selectedOrgId ? (
              <option value="">Please choose an organization first...</option>
            ) : availableContacts.length === 0 ? (
              <option value="">No contacts available for this organization</option>
            ) : (
              <>
                <option value="">CHOOSE RECIPIENT...</option>
                {availableContacts.map((contact) => (
                  <option key={contact.id} value={contact.email || ''}>
                    {(contact.name || 'Unnamed Contact')} ({(contact.email) || 'No Email'})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* 3. Subject Line + Purpose */}
        <div className="rounded-xl bg-card border border-border p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block pb-1 tracking-wide font-bold text-sm text-muted-foreground uppercase" htmlFor="email-purpose-select">Email Purpose</label>
              <select
                id="email-purpose-select"
                name="emailPurpose"
                value={emailPurpose}
                onChange={(e) => setEmailPurpose(e.target.value)}
                className="w-full min-h-[52px] rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Check-in">Check-in</option>
                <option value="Quarterly Planning">Quarterly Planning</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Re-engagement">Re-engagement</option>
              </select>
            </div>
            <div>
              <label className="block pb-1 tracking-wide font-bold text-sm text-muted-foreground uppercase" htmlFor="subject-input">Subject</label>
              <input
                id="subject-input"
                name="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="STRATEGIC FOLLOW-UP..."
                className="w-full min-h-[52px] rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* 4. Tone Selector */}
        <div className="rounded-xl bg-card border border-border p-5 md:p-6">
          <label className="block pb-2 tracking-wide font-bold text-sm text-muted-foreground uppercase">Tone</label>
          <div className="flex flex-row flex-wrap gap-3">
            {['professional', 'formal', 'casual', 'enthusiastic'].map((t) => (
              <button
                key={t}
                type="button"
                className={clsx(
                  'lmc-tone-pill',
                  tone === t
                    ? 'lmc-tone-pill--active'
                    : 'lmc-tone-pill--inactive',
                )}
                onClick={() => setTone(t)}
                disabled={isGenerating}
              >
                {t === 'professional' && 'WARM & PROFESSIONAL'}
                {t === 'formal' && 'STRICT & FORMAL'}
                {t === 'casual' && 'CASUAL & FRIENDLY'}
                {t === 'enthusiastic' && 'ENTHUSIASTIC & DRIVEN'}
              </button>
            ))}
          </div>
        </div>

        {/* 5. AI Prompt & Generate */}
        <div className="rounded-xl bg-card border border-border p-5 md:p-6">
          <label className="block pb-1 tracking-wide font-bold text-sm text-muted-foreground uppercase" htmlFor="ai-prompt-input">AI Mission Objectives</label>
          <div className="flex flex-row gap-3">
            <input
              id="ai-prompt-input"
              name="customInstructions"
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="E.G., FOLLOW UP ON INFOSESSION, PROPOSE NEXT MEETING..."
              className="flex-1 min-h-[52px] rounded-xl border border-border bg-secondary text-foreground px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={handleGenerateAIEmail}
              disabled={isGenerating || !activeOrg}
              className="lmc-email-action-btn lmc-btn-inline px-6 min-h-[52px] rounded-xl bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest shadow-sm hover:bg-primary/90 disabled:opacity-50 shrink-0"
            >
              {isGenerating ? (
                <span className="flex items-center gap-3"><div className="spinner-ring-sm" /> Generating</span>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          {isGenerating && (
            <p className="mt-1.5 text-sm text-muted-foreground font-semibold">
              AI is crafting your communication node...
            </p>
          )}
        </div>

        {/* 6. Editable Email Body */}
        <div className="rounded-xl bg-card border border-border p-5 md:p-6">
          <label htmlFor="email-body-textarea" className="block pb-2 tracking-wide font-bold text-sm text-muted-foreground uppercase">Editable Email Body</label>
          <div className="relative">
            <textarea
              id="email-body-textarea"
              name="emailBody"
              value={generatedEmail}
              onChange={e => setGeneratedEmail(e.target.value)}
              aria-label="Editable Email Body"
              placeholder="AI-generated email will appear here. You can edit before sending."
              className="w-full min-h-[220px] rounded-xl border border-border bg-secondary text-foreground p-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical shadow-sm placeholder:text-muted-foreground"
              disabled={isGenerating}
            />
            {isGenerating && (
              <div className="absolute inset-0 rounded-xl border border-border bg-card/90 p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-11/12 rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-4/5 rounded bg-muted" />
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Generating draft...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4 pt-4">
        <button
          type="button"
          className="lmc-email-action-btn lmc-btn-inline flex-[2] min-h-[52px] rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest shadow-sm hover:bg-primary/90 disabled:opacity-50"
          onClick={handleSendEmail}
          disabled={loading || isPending}
        >
          {loading || isPending ? 'Sending...' : 'Send Email'}
        </button>
        <button
          type="button"
          className="lmc-email-action-btn lmc-email-action-btn--neutral lmc-btn-inline flex-1 min-h-[52px] rounded-xl border border-border text-foreground font-bold text-sm uppercase tracking-widest shadow-sm hover:bg-muted"
          onClick={handleCopy}
          disabled={!generatedEmail}
        >
          Copy
        </button>
        <button
          type="button"
          className="lmc-email-action-btn lmc-email-action-btn--neutral lmc-btn-inline flex-1 min-h-[52px] rounded-xl border border-brand-500/30 text-brand-700 dark:text-brand-400 font-bold text-sm uppercase tracking-widest shadow-sm hover:bg-brand-500/10"
          onClick={() => setShowPreview((p) => !p)}
        >
          {showPreview ? 'Hide Preview' : 'Preview'}
        </button>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-10 shadow-xl max-w-lg w-full mx-4 flex flex-col gap-5 relative items-center">
            <button type="button" className="lmc-close-btn" onClick={() => setShowPreview(false)}>&times;</button>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">Email Preview</h3>
            <div className="text-sm text-muted-foreground">To: <span className="text-foreground font-semibold">{to || 'NO TARGET SPECIFIED'}</span></div>
            <div className="text-sm text-muted-foreground">Subject: <span className="text-primary italic uppercase font-semibold">{subject || 'UNSPECIFIED MISSION'}</span></div>
            <div className="whitespace-pre-wrap text-foreground leading-relaxed italic border border-border rounded-xl p-6 bg-muted min-h-[120px] w-full text-sm">
              {generatedEmail || 'AWAITING MISSION INTEL...'}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default EmailComposerPage;