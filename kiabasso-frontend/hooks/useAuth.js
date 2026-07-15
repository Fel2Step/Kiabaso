'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = AuthService.getUser();
    const storedWallet = AuthService.getWallet();
    if (storedUser) setUser(storedUser);
    if (storedWallet) setWallet(storedWallet);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (AuthService.isAuthenticated()) {
      try {
        const response = await AuthService.getProfile();
        if (response.success) {
          setUser(response.data.user);
          setWallet(response.data.wallet);
        }
      } catch {
        // silent
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await AuthService.login(email, password);
    if (response.success) {
      setUser(response.data.user);
      setWallet(response.data.wallet);
    }
    return response;
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const response = await AuthService.register(name, email, password, phone);
    if (response.success) {
      setUser(response.data.user);
      setWallet(response.data.wallet);
    }
    return response;
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setWallet(null);
  }, []);

  return { user, wallet, loading, login, register, logout, refreshProfile };
}
