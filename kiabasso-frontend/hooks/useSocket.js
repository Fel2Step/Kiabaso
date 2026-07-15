'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export function useSocket() {
  const chatSocketRef = useRef(null);
  const notifSocketRef = useRef(null);

  const connectChat = useCallback(() => {
    if (chatSocketRef.current?.connected) return chatSocketRef.current;

    const token = api.getToken();
    if (!token) return null;

    const socket = io(`${WS_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Chat conectado');
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Chat desconectado');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Erro de conexão:', err.message);
    });

    chatSocketRef.current = socket;
    return socket;
  }, []);

  const connectNotifications = useCallback(() => {
    if (notifSocketRef.current?.connected) return notifSocketRef.current;

    const token = api.getToken();
    if (!token) return null;

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    notifSocketRef.current = socket;
    return socket;
  }, []);

  const disconnectAll = useCallback(() => {
    if (chatSocketRef.current) {
      chatSocketRef.current.disconnect();
      chatSocketRef.current = null;
    }
    if (notifSocketRef.current) {
      notifSocketRef.current.disconnect();
      notifSocketRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnectAll();
    };
  }, [disconnectAll]);

  return { connectChat, connectNotifications, disconnectAll, chatSocket: chatSocketRef, notifSocket: notifSocketRef };
}
