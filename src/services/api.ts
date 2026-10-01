import { Property, SyncQueueItem, User, SystemSettings, ActivityLog, AccessRequest } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('property_hub_token');
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new ApiError(errMsg, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // ================= AUTH =================
  async login(username: string, password: string): Promise<{ user: User; token: string; expires_at: string }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async register(username: string, full_name: string, password: string): Promise<{ user: User; token: string; expires_at: string }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, full_name, password }),
    });
  },

  async requestAccess(data: {
    full_name: string;
    phone: string;
    email: string;
    agency_name?: string;
    city?: string;
    desired_username: string;
    password: string;
  }): Promise<{
    success: boolean;
    message: string;
    request_id: string;
    owner_email: string;
    owner_whatsapp: string;
    mailto_link: string;
    whatsapp_link: string;
    email_notification: {
      to: string;
      subject: string;
      body: string;
    };
  }> {
    return request('/auth/request-access', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verify(): Promise<{ user: User }> {
    return request('/auth/verify');
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore if offline
    }
  },

  // ================= PROPERTIES (USER SPECIFIC) =================
  async getProperties(): Promise<{ properties: Property[] }> {
    return request('/properties');
  },

  async getProperty(id: string): Promise<{ property: Property }> {
    return request(`/properties/${id}`);
  },

  async createProperty(property: Partial<Property>): Promise<{ property: Property }> {
    return request('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<{ property: Property }> {
    return request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  },

  async deleteProperty(id: string): Promise<{ success: boolean; deleted_id: string }> {
    return request(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // ================= BATCH SYNC =================
  async syncBatch(items: SyncQueueItem[]): Promise<{
    processed: string[];
    rejected: { id: string; reason: string }[];
    latestProperties: Property[];
  }> {
    return request('/properties/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // ================= OWNER BACKEND =================
  async getOwnerOverview(): Promise<{
    users: (User & { properties_count: number; available_count: number; sold_count: number; on_hold_count: number; images_count: number })[];
    properties_count: number;
    images_count: number;
    portfolio_value: number;
    activity_logs: ActivityLog[];
    settings: SystemSettings;
    database_file_size: number;
  }> {
    return request('/owner/overview');
  },

  async createOwnerUser(data: { username: string; full_name: string; password: string; role?: 'user' | 'owner' }): Promise<{ user: User }> {
    return request('/owner/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOwnerUserStatus(userId: string, is_active: boolean): Promise<{ success: boolean }> {
    return request(`/owner/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  },

  async resetOwnerUserPassword(userId: string, new_password: string): Promise<{ success: boolean; message: string }> {
    return request(`/owner/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ new_password }),
    });
  },

  async deleteOwnerUser(userId: string): Promise<{ success: boolean }> {
    return request(`/owner/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getOwnerProperties(): Promise<{ properties: (Property & { employee_username: string; employee_name: string })[] }> {
    return request('/owner/properties');
  },

  async updateOwnerProperty(id: string, data: Partial<Property>): Promise<{ property: Property }> {
    return request(`/owner/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteOwnerProperty(id: string): Promise<{ success: boolean }> {
    return request(`/owner/properties/${id}`, {
      method: 'DELETE',
    });
  },

  async getOwnerBackup(): Promise<any> {
    return request('/owner/backup');
  },

  async restoreOwnerBackup(databasePayload: any): Promise<{ success: boolean; restored_properties_count: number }> {
    return request('/owner/restore', {
      method: 'POST',
      body: JSON.stringify(databasePayload),
    });
  },

  async updateOwnerSettings(settings: Partial<SystemSettings>): Promise<{ settings: SystemSettings }> {
    return request('/owner/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  // ================= OWNER ACCESS & PAYMENT REQUESTS =================
  async getOwnerAccessRequests(): Promise<{ requests: AccessRequest[] }> {
    return request('/owner/access-requests');
  },

  async approveOwnerAccessRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    return request(`/owner/access-requests/${requestId}/approve`, {
      method: 'POST',
    });
  },

  async rejectOwnerAccessRequest(requestId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return request(`/owner/access-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async deleteOwnerAccessRequest(requestId: string): Promise<{ success: boolean }> {
    return request(`/owner/access-requests/${requestId}`, {
      method: 'DELETE',
    });
  },
};
