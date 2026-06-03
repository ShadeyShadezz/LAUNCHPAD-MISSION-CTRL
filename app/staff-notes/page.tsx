'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, MessageSquare, FileText } from 'lucide-react';
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
            <p className="mt-1 text-sm text-muted-foreground">Shared notes visible to all staff members.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button className="underline text-sm" onClick={fetchNotes}>Retry</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="lmc-surface p-4 md:p-5 flex gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a note for the team..."
              rows={2}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button
              type="submit"
              disabled={posting || !content.trim()}
              className="self-end"
            >
              {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="lmc-surface p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">{note.content}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{note.author.fullName}</span>
                      <span>&middot;</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
