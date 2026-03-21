'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Fetch initial data
  const fetchAuctions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auctions`);
      const data = await res.json();
      if (data.success) {
        setAuctions(data.data);
      }
    } catch (err) {
      console.error('[useAuctions] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAuctions();

    // Connect Socket.io
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    socket.on('auction:update', (data) => {
      setAuctions(data);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAuctions]);

  return { auctions, loading, connected };
}
