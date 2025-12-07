"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export interface MinerStats {
  pendingShares: number;
  pendingBalance: number;
  totalPaid: number;
  lastPayment: string | null;
  lastPaymentLink: string | null;
  performance: {
    hashrate: number;
    sharesPerSecond: number;
  };
  payments: Array<{
    id: string;
    amount: number;
    transactionConfirmationData: string;
    created: string;
  }>;
  performanceSamples: Array<{
    timestamp: string;
    hashrate: number;
    sharesPerSecond: number;
  }>;
}

export interface LiveMinerData {
  stats: MinerStats;
  isLoading: boolean;
  isLive: boolean;
  lastApiUpdate: number;
  lastUpdate?: string;
  notifications: Array<{
    id: string;
    type: 'hashrate' | 'block-found' | 'block-unlocked' | 'payment';
    message: string;
    timestamp: string;
    data?: any;
  }>;
  refetch: () => void;
}

export function useMinerLiveData(
  poolId: string,
  address: string,
  initialStats: MinerStats,
  options: {
    refreshInterval?: number;
    maxNotifications?: number;
    notificationRetentionTime?: number;
  } = {}
): LiveMinerData {
  const {
    refreshInterval = 30000,
    maxNotifications = 5,
    notificationRetentionTime = 300000 // 5 minutes
  } = options;

  const [lastUpdate, setLastUpdate] = useState<string>();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'hashrate' | 'block-found' | 'block-unlocked' | 'payment';
    message: string;
    timestamp: string;
    data?: any;
  }>>([]);

  // Add notification helper
  const addNotification = useCallback((
    type: 'hashrate' | 'block-found' | 'block-unlocked' | 'payment',
    message: string,
    data?: any
  ) => {
    const notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    setNotifications(prev => [notification, ...prev.slice(0, maxNotifications - 1)]);
  }, [maxNotifications]);

  // Simple refresh function that can be called by parent components
  const refetch = useCallback(() => {
    setLastUpdate(new Date().toISOString());
  }, []);

  // Clean up old notifications
  useEffect(() => {
    const cleanup = setInterval(() => {
      setNotifications(prev => prev.filter(n => 
        Date.now() - new Date(n.timestamp).getTime() < notificationRetentionTime
      ));
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, [notificationRetentionTime]);

  return {
    stats: initialStats,
    isLoading: false,
    isLive: false,
    lastApiUpdate: Date.now(),
    lastUpdate,
    notifications,
    refetch
  };
}