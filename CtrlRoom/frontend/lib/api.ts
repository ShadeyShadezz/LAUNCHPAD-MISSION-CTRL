// API utility for calling backend

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

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

  // Students
  getStudents: () => apiFetch('/students'),
  getStudent: (id: string) => apiFetch(`/students/${id}`),
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

  // Interactions
  getInteractions: () => apiFetch('/interactions'),
  createInteraction: (data: any) => apiFetch('/interactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Dashboard
  getDashboard: () => apiFetch('/staff/dashboard'),

  // Staff
  getStaff: () => apiFetch('/staff'),
  getActivityLogs: () => apiFetch('/activity-logs'),

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
};