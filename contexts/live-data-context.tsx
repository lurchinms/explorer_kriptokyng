'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PoolData {
  id: string;
  name: string;
  hashrate: number;
}

interface LiveDataContextType {
  pools: PoolData[];
  poolHashrates: Record<string, number>;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [pools, setPools] = useState<PoolData[]>([
    { id: 'btc', name: 'Bitcoin', hashrate: 1250000000 },
    { id: 'eth', name: 'Ethereum', hashrate: 980000000 },
    { id: 'ltc', name: 'Litecoin', hashrate: 450000000 },
  ]);
  
  const [poolHashrates, setPoolHashrates] = useState<Record<string, number>>({
    btc: 1250000000,
    eth: 980000000,
    ltc: 450000000,
  });

  // Mock live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPoolHashrates(prev => ({
        ...prev,
        btc: prev.btc + (Math.random() - 0.5) * 100000000,
        eth: prev.eth + (Math.random() - 0.5) * 80000000,
        ltc: prev.ltc + (Math.random() - 0.5) * 50000000,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <LiveDataContext.Provider value={{ pools, poolHashrates }}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveData() {
  const context = useContext(LiveDataContext);
  
  if (!context) {
    console.warn('LiveData context not found, using mock implementation');
    return { 
      pools: [], 
      poolHashrates: {} 
    };
  }

  return context;
}
