'use client';

import { Mail, Send, Save, Eye } from 'lucide-react';
import { useState } from 'react';

const EmailComposerPage = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tone, setTone] = useState('professional');
  const [emailType, setEmailType] = useState('follow-up');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const insertableVariables = [
    'PartnerName',
    'Primary Contact',
    'Staff Name',
    'Interaction Date',
    'Student Count',
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Email Composer
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            AI-powered email drafting with customization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>
                Email Setup
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    Email Type
                  </label>
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="follow-up">Partner Follow-up</option>
                    <option value="thank-you">Thank You</option>
                    <option value="outreach">Outreach</option>
                    <option value="introduction">Introduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="professional">Warm & Professional</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    AI Instructions (Optional)
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Add specific instructions for the AI..."
                    className="w-full px-3 py-2 border rounded-lg h-24 resize-none"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <button
                  className="w-full py-2 rounded-lg font-semibold text-white transition-all"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Generate with AI
                </button>
              </div>
            </div>

            {/* Insertable Variables */}
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>
                Insert Variables
              </h3>
              <div className="flex flex-wrap gap-2">
                {insertableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => setBody(body + `{{${variable}}}`)}
                    className="px-2 py-1 text-xs rounded border transition-all"
                    style={{
                      backgroundColor: "var(--secondary)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    To
                  </label>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    Message
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Compose your email..."
                    className="w-full px-4 py-2 border rounded-lg h-64 resize-none font-mono text-sm"
                    style={{
                      backgroundColor: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                }}
              >
                <Eye size={18} />
                Preview
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-foreground)",
                }}
              >
                <Save size={18} />
                Save Draft
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Send size={18} />
                Send Email
              </button>
            </div>

            {showPreview && (
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--secondary)",
                  borderColor: "var(--border)",
                }}
              >
                <h3 className="font-bold mb-2" style={{ color: "var(--secondary-foreground)" }}>
                  Preview
                </h3>
                <div
                  className="rounded bg-white p-4"
                  style={{
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                  }}
                >
                  <p className="font-bold mb-2">{subject || '(No subject)'}</p>
                  <div className="text-sm whitespace-pre-wrap">{body || '(No content)'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposerPage;
