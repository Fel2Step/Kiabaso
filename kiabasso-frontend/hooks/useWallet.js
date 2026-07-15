'use client';
import { useState, useCallback } from 'react';
import api from '../lib/api';

export function useWallet() {
  const [loading, setLoading] = useState(false);

  const getBalance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallet');
      if (response.success) {
        localStorage.setItem('kiabasso_wallet', JSON.stringify(response.data));
        return response.data;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deposit = useCallback(async (amount) => {
    setLoading(true);
    try {
      const response = await api.post('/wallet/deposit', { amount });
      if (response.success) {
        localStorage.setItem('kiabasso_wallet', JSON.stringify(response.data));
        return response;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deposit = useCallback(async (amount) => {
    setLoading(true);
    try {
      const response = await api.post('/wallet/deposit', { amount });
      if (response.success) {
        localStorage.setItem('kiabasso_wallet', JSON.stringify(response.data));
        return response;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const withdraw = useCallback(async (amount) => {
    setLoading(true);
    try {
      const response = await api.post('/wallet/withdraw', { amount });
      if (response.success) {
        localStorage.setItem('kiabasso_wallet', JSON.stringify(response.data));
        return response;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      return await api.get('/wallet/history', { page });
    } finally {
      setLoading(false);
    }
  }, []);

  return { getBalance, deposit, withdraw, getHistory, loading };
}
