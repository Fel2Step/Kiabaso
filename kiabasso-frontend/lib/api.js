const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kiabasso_token');
  }

  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kiabasso_refresh');
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('kiabasso_token', accessToken);
    if (refreshToken) localStorage.setItem('kiabasso_refresh', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('kiabasso_token');
    localStorage.removeItem('kiabasso_refresh');
    localStorage.removeItem('kiabasso_user');
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error('Failed to refresh token');

    const data = await res.json();
    this.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && token) {
      try {
        const newToken = await this.refreshToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });
      } catch {
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Sessão expirada');
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }
    return data;
  }

  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint, formData) {
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.status === 401 && token) {
      try {
        const newToken = await this.refreshToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });
      } catch {
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Sessão expirada');
      }
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro no upload');
    return data;
  }
}

const api = new ApiClient();
export default api;
