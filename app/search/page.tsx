'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type PartnershipContact = {
  id: string;
  name: string;
  email: string;
  contactType: string;
};

type Partnership = {
  id: string;
  organizationName?: string;
  partnerStatus?: string | null;
  courseNumber?: number | null;
  contacts?: PartnershipContact[];
};


import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isDatabaseLoading, setIsDatabaseLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (!user) {
      setIsDatabaseLoading(false);
      return;
    }

    const fetchPartnerships = async () => {
      setIsDatabaseLoading(true);
      setDbError(null);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/partnerships', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          setDbError('Failed to load partnerships.');
          setPartnerships([]);
          return;
        }
        const data = await response.json();
        setPartnerships(Array.isArray(data) ? data : []);
      } catch (err) {
        setDbError('Database link latent.');
        setPartnerships([]);
      } finally {
        setIsDatabaseLoading(false);
      }
    };
    fetchPartnerships();
  }, [user]);

  const filteredResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return partnerships.filter((partnership) => {
      const orgName = (partnership.organizationName || '').toLowerCase();
      const status = (partnership.partnerStatus || '').toLowerCase();
      const courseNumber = String(partnership.courseNumber ?? '').toLowerCase();

      const contactMatch = (partnership.contacts || []).some((contact) => {
        const contactName = (contact.name || '').toLowerCase();
        const contactEmail = (contact.email || '').toLowerCase();
        return (
          contactName.includes(normalized) ||
          contactEmail.includes(normalized)
        );
      });

      return (
        orgName.includes(normalized) ||
        status.includes(normalized) ||
        courseNumber.includes(normalized) ||
        contactMatch
      );
    });
  }, [partnerships, query]);

  // Safe Return Guard: Isolate auth/session from data loading
  if (isAuthLoading) {
    return <div className="lmc-page text-muted-foreground">Synchronizing Mission Secure Channel...</div>;
  }
  if (!user) {
    return null;
  }

  if (isDatabaseLoading) {
    return <div className="lmc-page text-muted-foreground">Loading search interface...</div>;
  }

  return (
    <div className="lmc-page">
      <div className="lmc-page-accent" />
      <main className="lmc-page-inner max-w-7xl">
        {dbError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive font-semibold">
            {dbError} <button className="ml-2 underline" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        <div>
          <h1 className="lmc-page-title">Global Deep Search</h1>
          <p className="mt-2 text-sm text-muted-foreground">
          Search organization names, statuses, course numbers, and nested contact records in real time.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Type anything: name, status, course number, or contact email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="lmc-input pl-11 pr-4 py-3"
          />
        </div>

        {!dbError && query.trim().length === 0 && (
          <div className="lmc-surface px-4 py-3 text-muted-foreground">
            Enter a query to begin deep search.
          </div>
        )}

        {!dbError && query.trim().length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {filteredResults.length} result{filteredResults.length === 1 ? '' : 's'} found
            </p>

            {filteredResults.length === 0 ? (
              <div className="lmc-surface px-4 py-3 text-muted-foreground">
                No matches found for your query.
              </div>
            ) : (
              filteredResults.map((partnership) => (
                <div
                  key={partnership.id}
                  className="lmc-surface lmc-surface--interactive px-5 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-bold text-foreground">
                        {partnership.organizationName || 'Unnamed Partnership'}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <span className="text-sm text-muted-foreground">
                          Status: <span className="font-semibold text-foreground">{partnership.partnerStatus || 'Unspecified'}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">&middot;</span>
                        <span className="text-sm text-muted-foreground">
                          Course: <span className="font-semibold text-foreground">{partnership.courseNumber ?? 'N/A'}</span>
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/partnerships/${partnership.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                    >
                      Details
                    </Link>
                  </div>

                  {(partnership.contacts || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(partnership.contacts || []).slice(0, 3).map((contact) => (
                        <div
                          key={contact.id}
                          className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs"
                        >
                          <span className="font-semibold text-foreground">{contact.name}</span>
                          <span className="mx-1 text-muted-foreground">&middot;</span>
                          <span className="text-muted-foreground">{contact.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
