export interface HashrateHistoryPoint {
  timestamp: string;
  hashrate: number;
  unit: string;
}

export interface WorkerPerformanceData {
  worker: string;
  hashrate: number;
  shares: number;
  lastSeen: string;
  efficiency: number;
}

export interface MinerStatsSummary {
  totalHashrate: number;
  totalShares: number;
  workersCount: number;
  lastSeen: string;
  efficiency: number;
}

export interface MinerPayment {
  amount: number;
  timestamp: string;
  txHash: string;
  status: string;
}

export interface ContributedBlock {
  height: number;
  hash: string;
  timestamp: string;
  reward: number;
  minerShare: number;
}

export async function getMinerHashrateHistory(poolId: string, address: string, timeRange: string = '24h'): Promise<HashrateHistoryPoint[]> {
  try {
    // Mock implementation - replace with actual database query
    const mockData: HashrateHistoryPoint[] = [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), hashrate: 1250000000, unit: 'H/s' },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), hashrate: 1180000000, unit: 'H/s' },
      { timestamp: new Date(Date.now() - 10800000).toISOString(), hashrate: 1320000000, unit: 'H/s' },
    ];

    return mockData;
  } catch (error) {
    console.error('Error fetching hashrate history:', error);
    return [];
  }
}

export async function getWorkerPerformance(poolId: string, address: string): Promise<WorkerPerformanceData[]> {
  try {
    // Mock implementation - replace with actual database query
    const mockData: WorkerPerformanceData[] = [
      { worker: 'rig1', hashrate: 125000000, shares: 1250, lastSeen: new Date().toISOString(), efficiency: 95.5 },
      { worker: 'rig2', hashrate: 98000000, shares: 980, lastSeen: new Date(Date.now() - 300000).toISOString(), efficiency: 92.1 },
    ];

    return mockData;
  } catch (error) {
    console.error('Error fetching worker performance:', error);
    return [];
  }
}

// Additional exports for API routes
export const getMinerWorkerStats = getWorkerPerformance;
export const getMinerStatsSummary = async (poolId: string, address: string): Promise<MinerStatsSummary> => {
  try {
    // Mock implementation
    return {
      totalHashrate: 1250000000,
      totalShares: 12500,
      workersCount: 2,
      lastSeen: new Date().toISOString(),
      efficiency: 94.2
    };
  } catch (error) {
    console.error('Error fetching miner stats summary:', error);
    throw error;
  }
};

export const getMinerPayments = async (poolId: string, address: string): Promise<MinerPayment[]> => {
  try {
    // Mock implementation
    return [
      {
        amount: 0.125,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        txHash: 'abc123...',
        status: 'confirmed'
      }
    ];
  } catch (error) {
    console.error('Error fetching miner payments:', error);
    return [];
  }
};

export const getPoolHashrateHistory = async (poolId: string, timeRange: string = '24h'): Promise<HashrateHistoryPoint[]> => {
  try {
    // Mock implementation
    return [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), hashrate: 5000000000, unit: 'H/s' },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), hashrate: 4800000000, unit: 'H/s' },
    ];
  } catch (error) {
    console.error('Error fetching pool hashrate history:', error);
    return [];
  }
};

export const getMinerContributedBlocks = async (poolId: string, address: string): Promise<ContributedBlock[]> => {
  try {
    // Mock implementation
    return [
      {
        height: 926844,
        hash: '00000000000000000006bb01c4818cfb7154e95e88b01e55e3f1251b7501d',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        reward: 3.13874683,
        minerShare: 0.125
      }
    ];
  } catch (error) {
    console.error('Error fetching contributed blocks:', error);
    return [];
  }
};
