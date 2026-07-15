import api from './api';

export const AuthService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.success) {
      api.setTokens(response.data.accessToken, response.data.refreshToken);
      localStorage.setItem('kiabasso_user', JSON.stringify(response.data.user));
      localStorage.setItem('kiabasso_wallet', JSON.stringify(response.data.wallet));
    }
    return response;
  },

  async register(name, email, password, phone) {
    const response = await api.post('/auth/register', { name, email, password, phone });
    if (response.success) {
      api.setTokens(response.data.accessToken, response.data.refreshToken);
      localStorage.setItem('kiabasso_user', JSON.stringify(response.data.user));
      localStorage.setItem('kiabasso_wallet', JSON.stringify(response.data.wallet));
    }
    return response;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    if (response.success) {
      localStorage.setItem('kiabasso_user', JSON.stringify(response.data.user));
      localStorage.setItem('kiabasso_wallet', JSON.stringify(response.data.wallet));
    }
    return response;
  },

  logout(router) {
    api.clearTokens();
    if (router) {
      router.push('/login');
    } else {
      window.location.href = '/login';
    }
  },

  getUser() {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('kiabasso_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getWallet() {
    if (typeof window === 'undefined') return null;
    try {
      const wallet = localStorage.getItem('kiabasso_wallet');
      return wallet ? JSON.parse(wallet) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('kiabasso_token');
  },
};
