'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/app/components/Button';

type Note = {
  id: string;
  content: string;
  author: { id: string; fullName: string };
  createdAt: string;
};

export default function StaffNotesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/staff-notes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load');
      setNotes(await res.json());
    } catch {
      setError('Could not load notes.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/staff-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) throw new Error('Failed to post');
      setContent('');
      await fetchNotes();
    } catch {
      setError('Failed to post note.');
    } finally {
      setPosting(false);
    }
  };

  if (isLoading) {
    return <div className="lmc-page text-muted-foreground">Loading...</div>;
  }
  if (!user) return null;

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <div className="lmc-page-inner max-w-3xl">
        <div className="lmc-page-header">
          <div>
            <h1 className="lmc-page-title">Staff Notes</h1>
            <p className="lmc-page-subtitle">Shared notes visible to all staff members.</p>
          </div>
        </div>

        {error && (
          <div className="lmc-banner lmc-banner--error flex items-center justify-between">
            <span>{error}</span>
            <button className="underline text-sm" onClick={fetchNotes}>Retry</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="lmc-surface p-5 md:p-6 grid grid-cols-[1fr_auto] items-stretch gap-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a note for the team..."
              rows={2}
              className="w-full min-h-[48px] rounded-xl lmc-input-base !border-0 focus:!border-0 px-4 py-3 text-sm resize-none"
            />
            <Button
              type="submit"
              size="xl"
              disabled={posting || !content.trim()}
              className="min-h-[48px] min-w-[120px] self-center justify-center px-6"
            >
              {posting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              Post
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" />
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="lmc-surface py-16 text-center">
            <div className="lmc-empty-state-icon mx-auto mb-3">
              <MessageSquare size={20} />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No notes yet</p>
            <p className="text-sm text-muted-foreground">Post one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => {
              const createdAt = new Date(note.createdAt);
              const createdDate = createdAt.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              });
              const createdTime = createdAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <div key={note.id} className="lmc-surface p-7">
                  <div className="min-w-0 flex-1">
                    <p className="text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">{note.content}</p>
                    <div className="mt-5 text-sm">
                      <span className="inline-flex items-center rounded-md bg-secondary/70 px-2.5 py-1 font-semibold text-foreground mr-[14px] mb-2">
                        {note.author.fullName}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-secondary/70 px-2.5 py-1 text-muted-foreground mr-[14px] mb-2">
                        {createdDate}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-secondary/70 px-2.5 py-1 text-muted-foreground mb-2">
                        {createdTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
