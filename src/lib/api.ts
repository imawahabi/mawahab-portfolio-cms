const RAW_API_BASE = import.meta.env.VITE_API_BASE || '/api';
const API_BASE = (RAW_API_BASE.endsWith('/') ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE) || '/api';
const AUTH_TOKEN_KEY = 'admin_token';

const withBase = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.set(key, String(value));
    });
  }

  const query = searchParams.toString();
  const basePath = withBase(path);
  return query ? `${basePath}?${query}` : basePath;
};

const getAuthHeaders = () => {
  if (typeof localStorage === 'undefined') return {} as Record<string, string>;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  getToken() {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  clearToken() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('خطأ في تسجيل الدخول');
    const data = await res.json();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('غير مصرح');
    return res.json();
  },

  async getProjects(params?: Record<string, string | number | boolean | undefined>) {
    const url = buildUrl('/projects', params);
    console.log('📡 Fetching projects from:', url);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      console.log('📡 Projects response status:', res.status);
      console.log('📡 Projects response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        console.error('📡 Projects failed:', res.statusText);
        throw new Error(`Failed to load projects: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const includeHidden = params?.includeHidden === true || params?.includeHidden === 'true';
      const normalized = Array.isArray(data)
        ? data.map((p) => ({
            ...p,
            isHidden: p.isHidden ?? p.is_hidden ?? false,
            typeLabel: p.typeLabel ?? p.type_label ?? '',
            typeLabelAr: p.typeLabelAr ?? p.type_label_ar ?? '',
            typeLabelEn: p.typeLabelEn ?? p.type_label_en ?? '',
          }))
        : data;
      const visibleOnly = Array.isArray(normalized)
        ? normalized.filter((p) => !p.isHidden)
        : normalized;
      console.log('📡 Projects data:', normalized);
      return includeHidden ? normalized : visibleOnly;
    } catch (error) {
      console.error('📡 Projects error:', error);
      throw error;
    }
  },

  async getProjectBySlug(slug: string) {
    const res = await fetch(withBase(`/projects/slug/${slug}`));
    if (!res.ok) throw new Error('Not found');
    return res.json();
  },

  async getServices(params?: Record<string, string | number | boolean | undefined>) {
    const url = buildUrl('/services', params);
    console.log('📡 Fetching services from:', url);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      console.log('📡 Services response status:', res.status);
      console.log('📡 Services response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        console.error('📡 Services failed:', res.statusText);
        throw new Error(`Failed to load services: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('📡 Services data:', data);
      return data;
    } catch (error) {
      console.error('📡 Services error:', error);
      throw error;
    }
  },

  async createProject(payload: any) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create');
    return res.json();
  },

  async updateProject(id: string, payload: any) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update');
    return res.json();
  },

  async deleteProject(id: string) {
    const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete');
    return true;
  },

  async createService(payload: any) {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create');
    return res.json();
  },

  async updateService(id: string, payload: any) {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update');
    return res.json();
  },

  async deleteService(id: string) {
    const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete');
    return true;
  },

  async createTestimonialInvite() {
    const res = await fetch(`${API_BASE}/testimonials/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error('فشل إنشاء رابط الدعوة');
    return res.json();
  },

  async submitTestimonial(payload: any) {
    const res = await fetch(`${API_BASE}/testimonials/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let message = 'فشل إرسال التقييم';
      try {
        const data = await res.json();
        message = data?.message || data?.error || message;
      } catch {
        // ignore parse errors
      }
      throw new Error(message);
    }
    return res.json();
  },

  async getTestimonials(params?: Record<string, string | number | boolean | undefined>) {
    const url = buildUrl('/testimonials', params);
    console.log('📡 Fetching testimonials from:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل في جلب الآراء');
    return res.json();
  },

  async getTestimonialInvites() {
    const res = await fetch(`${API_BASE}/testimonials/invites`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل في جلب روابط الدعوة');
    return res.json();
  },

  async deleteTestimonialInvite(idOrToken: string) {
    const res = await fetch(`${API_BASE}/testimonials/invites/${encodeURIComponent(idOrToken)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      let message = 'فشل في حذف الرابط';
      try {
        const data = await res.json();
        message = data?.message || data?.error || message;
      } catch {
        // ignore parse errors, fallback to default message
      }
      throw new Error(message);
    }
    return true;
  },

  async updateTestimonialStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/testimonials/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('فشل تحديث الحالة');
    return res.json();
  },

  async updateTestimonial(id: string, payload: any) {
    const res = await fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || 'فشل تحديث الرأي');
    }
    return res.json();
  },

  async deleteTestimonial(id: string) {
    const res = await fetch(`${API_BASE}/testimonials/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل الحذف');
    return true;
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
  },

  async getMessages() {
    const res = await fetch(`${API_BASE}/messages`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load messages');
    return res.json();
  },

  async createMessage(payload: any) {
    try {
      console.log('📡 Creating message to:', `${API_BASE}/contact`);
      console.log('📡 Message payload:', payload);
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('📡 Create message response status:', res.status);
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      console.log('📡 Create message response:', data);
      return data;
    } catch (error) {
      console.error('📡 Create message error:', error);
      throw error;
    }
  },

  async updateMessageStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/messages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update message status');
    }
    return res.json();
  },

  async deleteMessage(id: string) {
    const res = await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete message');
    return true;
  },

  async getCategories() {
    console.log('📡 Fetching categories from:', `${API_BASE}/categories`);
    try {
      const res = await fetch(`${API_BASE}/categories`);
      console.log('📡 Categories response status:', res.status);
      if (!res.ok) {
        console.error('📡 Categories failed:', res.statusText);
        throw new Error('Failed to load categories');
      }
      const data = await res.json();
      console.log('📡 Categories data:', data);
      return data;
    } catch (error) {
      console.error('📡 Categories error:', error);
      throw error;
    }
  },

  async createCategory(payload: any) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(id: string, payload: any) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string) {
    const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete category');
    return true;
  },

  async getPricingPackages() {
    throw new Error('Pricing packages disabled');
  },

  async getSettings() {
    console.log('📡 Fetching settings from:', `${API_BASE}/settings`);
    try {
      const res = await fetch(`${API_BASE}/settings`);
      console.log('📡 Settings response status:', res.status);
      if (!res.ok) {
        console.error('📡 Settings failed:', res.statusText);
        throw new Error('Failed to load settings');
      }
      const data = await res.json();
      console.log('📡 Settings data:', data);
      return data;
    } catch (error) {
      console.error('📡 Settings error:', error);
      throw error;
    }
  },

  async updateSettings(payload: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async getNotes() {
    const res = await fetch(`${API_BASE}/notes`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load notes');
    return res.json();
  },

  async createNote(payload: any) {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create note');
    return res.json();
  },

  async updateNote(id: string, payload: any) {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update note');
    return res.json();
  },

  async deleteNote(id: string) {
    const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete note');
    return true;
  },

  async uploadFile(file: File) {
    // Uploads معطلة؛ اعتمد على روابط خارجية للصور/الملفات
    throw new Error('Uploads are disabled; please use external URLs.');
  },
};

export type ApiProject = Awaited<ReturnType<typeof api.getProjectBySlug>>;
