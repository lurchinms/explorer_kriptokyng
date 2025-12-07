'use client';

import { useState, useEffect } from 'react';
import { useWebSocketSubscription } from '@/contexts/websocket-context';

export interface PoolStats {
  hashrate?: number;
  blocks?: number;
  payments?: number;
  lastBlockTime?: string;
  lastPaymentTime?: string;
}

export function usePoolStats(poolId?: string) {
  const [stats, setStats] = useState<PoolStats>({});

  // Subscribe to hashrate updates
  useWebSocketSubscription(['hashrateUpdated'], (message) => {
    if (!poolId || message.data.poolId === poolId) {
      setStats(prev => ({
        ...prev,
        hashrate: message.data.hashrate || message.data.value
      }));
    }
  });

  // Subscribe to block notifications
  useWebSocketSubscription(['blockFound', 'blockUnlocked'], (message) => {
    if (!poolId || message.data.poolId === poolId) {
      setStats(prev => ({
        ...prev,
        blocks: (prev.blocks || 0) + 1,
        lastBlockTime: message.timestamp
      }));
    }
  });

  // Subscribe to payment notifications
  useWebSocketSubscription(['payment'], (message) => {
    if (!poolId || message.data.poolId === poolId) {
      setStats(prev => ({
        ...prev,
        payments: (prev.payments || 0) + 1,
        lastPaymentTime: message.timestamp
      }));
    }
  });

  return stats;
}

export function useNotificationCount() {
  const [count, setCount] = useState(0);

  useWebSocketSubscription(undefined, () => {
    setCount(prev => prev + 1);
  });

  const resetCount = () => setCount(0);

  return { count, resetCount };
}

export function useConnectionHealth() {
  const [health, setHealth] = useState<'good' | 'warning' | 'error'>('good');
  const [lastSeen, setLastSeen] = useState<Date>(new Date());

  useWebSocketSubscription(undefined, () => {
    setLastSeen(new Date());
    setHealth('good');
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastSeen.getTime();
      
      if (timeSinceLastMessage > 60000) { // 1 minute
        setHealth('error');
      } else if (timeSinceLastMessage > 30000) { // 30 seconds
        setHealth('warning');
      } else {
        setHealth('good');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastSeen]);

  return { health, lastSeen };
}
