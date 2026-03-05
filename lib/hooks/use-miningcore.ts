import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

// Mock data for development
const mockPoolData = {
  paymentProcessing: {
    payoutScheme: 'pplns' // Can be 'pplns', 'pps', 'solo'
  }
};

const mockBlocksData = {
  foundBlocks: [
    {
      id: '1',
      height: 926849,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      reward: 3.13874683,
      confirmations: 120,
      miner: 'bc1qvzrqryq3ja8w7hnja2spmk9fdcgqwps5wz4afang5jecf2w0pqwd7k38'
    }
  ],
  contributedBlocks: [
    {
      id: '2', 
      height: 926848,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      reward: 1.5,
      confirmations: 85,
      miner: 'bc1qvzrqryq3ja8w7hnja2spmk9fdcgqwps5wz4afang5jecf2w0pqwd7k38'
    }
  ]
};

const mockPerformanceData = [
  {
    timestamp: Date.now() - 86400000, // 24 hours ago
    hashrate: 1250000000,
    shares: 12500,
    efficiency: 95
  },
  {
    timestamp: Date.now() - 43200000, // 12 hours ago
    hashrate: 1300000000,
    shares: 13000,
    efficiency: 97
  },
  {
    timestamp: Date.now() - 21600000, // 6 hours ago
    hashrate: 1280000000,
    shares: 12800,
    efficiency: 96
  },
  {
    timestamp: Date.now() - 3600000, // 1 hour ago
    hashrate: 1350000000,
    shares: 13500,
    efficiency: 98
  },
  {
    timestamp: Date.now(), // Current
    hashrate: 1400000000,
    shares: 14000,
    efficiency: 99
  }
];

export function usePool(poolId: string, options: { refetchOnMount?: boolean; refetchOnWindowFocus?: boolean } = {}) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        setData(mockPoolData);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching pool data:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId && options.refetchOnMount !== false) {
      fetchPoolData();
    }
  }, [poolId]);

  return { data, isLoading, isError };
}

export function useMinerBlocks(poolId: string, address: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        setData(mockBlocksData.foundBlocks);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching miner blocks:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId && address) {
      fetchBlocks();
    }
  }, [poolId, address]);

  return { data, isLoading, isError };
}

export function useMinerContributedBlocks(poolId: string | null, address: string | null) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchContributedBlocks = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        setData(mockBlocksData.contributedBlocks);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching contributed blocks:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId && address) {
      fetchContributedBlocks();
    }
  }, [poolId, address]);

  return { data, isLoading, isError };
}

export function useMinerPerformance(poolId: string, address: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        setData(mockPerformanceData);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching miner performance:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId && address) {
      fetchPerformance();
    }
  }, [poolId, address]);

  return { data, isLoading, isError };
}

export function useMinerDailyEarnings(poolId: string, address: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchDailyEarnings = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        const mockEarningsData = [
          { date: new Date(Date.now() - 6 * 24 * 3600000).toISOString().split('T')[0], amount: 0.125 },
          { date: new Date(Date.now() - 5 * 24 * 3600000).toISOString().split('T')[0], amount: 0.135 },
          { date: new Date(Date.now() - 4 * 24 * 3600000).toISOString().split('T')[0], amount: 0.118 },
          { date: new Date(Date.now() - 3 * 24 * 3600000).toISOString().split('T')[0], amount: 0.142 },
          { date: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split('T')[0], amount: 0.128 },
          { date: new Date(Date.now() - 1 * 24 * 3600000).toISOString().split('T')[0], amount: 0.131 },
          { date: new Date().toISOString().split('T')[0], amount: 0.126 },
        ];
        setData(mockEarningsData);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching daily earnings:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId && address) {
      fetchDailyEarnings();
    }
  }, [poolId, address]);

  return { data, isLoading, isError };
}

export function usePoolBlocks(poolId: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        setData(mockBlocksData.foundBlocks);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching pool blocks:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId) {
      fetchBlocks();
    }
  }, [poolId]);

  return { data, isLoading, isError };
}

export function usePoolPerformance(poolId: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        setData(mockPerformanceData);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching pool performance:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId) {
      fetchPerformance();
    }
  }, [poolId]);

  return { data, isLoading, isError };
}

export function useMinerPayments(poolId: string, address: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        // Mock implementation - replace with actual API call
        const mockPaymentsData = [
          {
            id: '1',
            amount: 0.125,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            txid: 'abc123...',
            status: 'confirmed'
          },
          {
            id: '2', 
            amount: 0.087,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            txid: 'def456...',
            status: 'confirmed'
          }
        ];
        setData(mockPaymentsData);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching miner payments:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolId && address) {
      fetchPayments();
    }
  }, [poolId, address]);

  return { data, isLoading, isError };
}
