// API utility for calling backend
import { env } from './env';

const API_BASE = env.backendUrl;

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || '';
  }
  return '';
};

// Generic fetch with authentication
async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...((options?.headers) as Record<string, string> || {}),
  };

  const isGetRequest = !options?.method || options.method === 'GET';

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // For GET requests, return appropriate default values when backend is unavailable
    if (isGetRequest) {
      console.warn(`Returning default data for ${endpoint} due to backend unavailability`);
      
      if (endpoint.includes('/students')) return [];
      if (endpoint.includes('/partners')) return [];
      if (endpoint.includes('/interactions')) return [];
      if (endpoint.includes('/staff/dashboard')) return { recentInteractions: [], pendingFollowups: 0 };
      if (endpoint.includes('/staff')) return [];
      if (endpoint.includes('/activity-logs')) return [];
      
      // Default to empty array for any other GET request
      return [];
    }
    
    // For POST/PUT/DELETE requests, throw the error
    throw error;
  }
}

export const api = {
  // Partners
  getPartners: () => apiFetch('/partners'),
  getPartner: (id: string) => apiFetch(`/partners/${id}`),
  createPartner: (data: any) => apiFetch('/partners', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePartner: (id: string, data: any) => apiFetch(`/partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePartner: (id: string) => apiFetch(`/partners/${id}`, { 
    method: 'DELETE' 
  }),

  // Interactions
  getInteractions: () => apiFetch('/interactions'),
  createInteraction: (data: any) => apiFetch('/interactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getInteraction: (id: string) => apiFetch(`/interactions/${id}`),
  updateInteraction: (id: string, data: any) => apiFetch(`/interactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteInteraction: (id: string) => apiFetch(`/interactions/${id}`, {
    method: 'DELETE'
  }),

  // Dashboard
  getDashboard: () => apiFetch('/staff/dashboard'),

  // Staff
  getStaff: () => apiFetch('/staff'),
  createStaff: (data: any) => apiFetch('/staff', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStaff: (id: string, data: any) => apiFetch(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteStaff: (id: string) => apiFetch(`/staff/${id}`, {
    method: 'DELETE'
  }),
  getActivityLogs: () => apiFetch('/activity-logs'),

  // Students
  getStudents: () => apiFetch('/students'),
  createStudent: (data: any) => apiFetch('/students', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStudent: (id: string, data: any) => apiFetch(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteStudent: (id: string) => apiFetch(`/students/${id}`, {
    method: 'DELETE'
  }),

  // Email
  sendEmail: (data: any) => apiFetch('/email/send', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // AI Email Generation
  generateEmail: (data: any) => apiFetch('/ai/generate-email', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Saved Searches
  getSavedSearches: (searchType: string) => apiFetch(`/saved-searches/${searchType}`),
  createSavedSearch: (data: any) => apiFetch('/saved-searches', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSavedSearch: (id: string, data: any) => apiFetch(`/saved-searches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSavedSearch: (id: string) => apiFetch(`/saved-searches/${id}`, {
    method: 'DELETE'
  }),
};