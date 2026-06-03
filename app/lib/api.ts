export type ActiveOrganization = {
  id: string;
  partnerId: string;
  orgId: string | null;
  name: string;
  tier: string | null;
  status: string;
  statusNormalized: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'UNKNOWN';
  primaryContactName: string;
  primaryContactEmail: string;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    contactType: string;
    title?: string | null;
  }>;
};

export type StaffDirectoryRow = {
  id: string;
  name: string;
  role: string;
  title: string;
};

type PartnershipsResponseRecord = {
  id: string;
  organizationName?: string;
  partnerType?: string | null;
  partnerStatus?: string | null;
  pastCohortMembers?: unknown;
  contacts?: Array<{
    id: string;
    name: string;
    email: string;
    contactType: string;
    title?: string | null;
  }>;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeStatus(value: string | null | undefined): ActiveOrganization['statusNormalized'] {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) return 'UNKNOWN';
  if (['active', 'activated', 'enabled'].includes(normalized)) return 'ACTIVE';
  if (['inactive', 'disabled', 'archived'].includes(normalized)) return 'INACTIVE';
  if (['pending', 'in-review', 'in review', 'awaiting', 'scaling'].includes(normalized)) return 'PENDING';
  return 'UNKNOWN';
}

export const api = {
  async getPartners() {
    const res = await fetch('/api/partners', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch partners');
    return res.json();
  },

  async getInteractions() {
    const res = await fetch('/api/interactions', {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch interactions');
    return res.json();
  },

  async getStaff() {
    const res = await fetch('/api/staff', {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  async getActivityLogs(filters?: { action?: string; targetType?: string; staffId?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.action && filters.action !== 'all') params.set('action', filters.action);
    if (filters?.targetType && filters.targetType !== 'all') params.set('targetType', filters.targetType);
    if (filters?.staffId) params.set('staffId', filters.staffId);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    const qs = params.toString();
    const res = await fetch(`/api/activity-logs${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      let message = 'Activity tracking temporarily offline';
      try {
        const payload = await res.json();
        if (payload?.error && typeof payload.error === 'string') {
          message = payload.error;
        }
      } catch {
        // Ignore JSON parse failures
      }
      throw new Error(message);
    }
    return res.json();
  },

  async getActiveOrganizations(): Promise<ActiveOrganization[]> {
    const res = await fetch('/api/partnerships', {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch organizations');
    }
    const payload = (await res.json()) as PartnershipsResponseRecord[];
    const records = Array.isArray(payload) ? payload : [];

    return records.map((record) => {
      const contacts = Array.isArray(record.contacts) ? record.contacts : [];
      const primaryContact = contacts.find(
        (contact) => (contact.contactType || '').toUpperCase() === 'PRIMARY'
      );
      return {
        id: record.id,
        partnerId: record.id,
        orgId: null,
        name: record.organizationName || 'Unknown Organization',
        tier: record.partnerType ?? null,
        status: record.partnerStatus || 'Unknown',
        statusNormalized: normalizeStatus(record.partnerStatus),
        primaryContactName: primaryContact?.name || 'N/A',
        primaryContactEmail: primaryContact?.email || '',
        contacts,
      } satisfies ActiveOrganization;
    });
  },

  async getOrganizations(): Promise<ActiveOrganization[]> {
    return this.getActiveOrganizations();
  },

  async getStaffDirectory(): Promise<StaffDirectoryRow[]> {
    const organizations = await this.getActiveOrganizations();
    const byEmail = new Map<string, StaffDirectoryRow>();
    organizations.forEach((org) => {
      org.contacts.forEach((contact) => {
        const key = (contact.email || '').trim().toLowerCase();
        if (!key || byEmail.has(key)) return;
        byEmail.set(key, {
          id: contact.id,
          name: contact.name || 'Unknown Contact',
          role: (contact.contactType || 'STAFF').replace(/_/g, ' '),
          title: contact.title?.trim() || 'Not specified',
        });
      });
    });
    return Array.from(byEmail.values()).sort((a, b) => a.name.localeCompare(b.name));
  },

  async createInteraction(data: {
    partnerId: string;
    interactionType: string;
    date: string;
    studentCount: number;
    sharedNotes: string;
    needsFollowup: boolean;
    followupDueDate: string | null;
  }) {
    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create interaction');
    return res.json();
  },

  async generateEmail(data: { partnerId: string; customInstructions?: string; tone?: string; subject?: string; recipientName?: string; recipientEmail?: string; promptContext?: { organizationName: string; tier: string; primaryContact: string; purpose: string } }) {
    const res = await fetch('/api/email/generate', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      try {
        const payload = await res.json();
        if (payload?.error && typeof payload.error === 'string') {
          throw new Error(payload.error);
        }
      } catch {
        // fall through to generic error
      }
      throw new Error('Failed to generate email');
    }
    return res.json();
  },
};
