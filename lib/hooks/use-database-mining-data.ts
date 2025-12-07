import { useQuery } from '@tanstack/react-query';

// Types for database API responses
interface MinerHashrateHistoryData {
  timestamp: number;
  hashrate: number;
  sharesPerMinute: number;
  created: Date;
}

interface PoolHashrateHistoryData {
  timestamp: number;
  poolHashrate: number;
  connectedMiners: number;
  poolEffort: number;
  validShares: number;
  invalidShares: number;
  created: Date;
}

interface DatabaseApiResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  error?: string;
}

// Hook to get extended miner hashrate history from database
export function useMinerHashrateHistoryDB(
  poolId: string,
  address: string,
  hours: number = 24,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['miner-hashrate-history-db', poolId, address, hours],
    queryFn: async (): Promise<MinerHashrateHistoryData[]> => {
      const response = await fetch(
        `/api/miners/${poolId}/${address}/hashrate-history?hours=${hours}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch miner hashrate history');
      }
      
      const result: DatabaseApiResponse<MinerHashrateHistoryData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      return result.data;
    },
    enabled: enabled && !!poolId && !!address,
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Hook to get extended pool hashrate history from database
export function usePoolHashrateHistoryDB(
  poolId: string,
  hours: number = 24,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['pool-hashrate-history-db', poolId, hours],
    queryFn: async (): Promise<PoolHashrateHistoryData[]> => {
      const response = await fetch(
        `/api/pools/${poolId}/hashrate-history?hours=${hours}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch pool hashrate history');
      }
      
      const result: DatabaseApiResponse<PoolHashrateHistoryData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      return result.data;
    },
    enabled: enabled && !!poolId,
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Hook to get combined miner and pool hashrate history for comparison
export function useCombinedHashrateHistoryDB(
  poolId: string,
  address: string,
  hours: number = 24,
  enabled: boolean = true
) {
  const minerQuery = useMinerHashrateHistoryDB(poolId, address, hours, enabled);
  const poolQuery = usePoolHashrateHistoryDB(poolId, hours, enabled);

  return {
    minerData: minerQuery.data,
    poolData: poolQuery.data,
    isLoading: minerQuery.isLoading || poolQuery.isLoading,
    isError: minerQuery.isError || poolQuery.isError,
    error: minerQuery.error || poolQuery.error,
    refetch: () => {
      minerQuery.refetch();
      poolQuery.refetch();
    }
  };
} 