import { siteConfig } from '@/config/Site';

export interface MinerCheckResponse {
  exists: boolean;
  address?: string;
  poolId?: string;
  stats?: {
    hashrate: number;
    shares: number;
    lastSeen: string;
  };
}

export async function checkMinerAddress(address: string): Promise<MinerCheckResponse> {
  try {
    // Mock implementation - replace with actual Miningcore API call
    const response = await fetch(`${siteConfig.api.baseUrl}/miners/check/${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking miner address:', error);
    return {
      exists: false
    };
  }
}

// Export as default for compatibility
export const miningCoreApi = {
  checkMinerAddress,
  getMinerStats: async (poolId: string, address: string) => {
    // Mock implementation
    return {
      hashrate: 1250000000,
      shares: 12500,
      lastSeen: new Date().toISOString(),
      performance: {
        daily: 1250000000,
        weekly: 8750000000,
        monthly: 37500000000,
        workers: {
          'worker1': { hashrate: 500000000, sharesPerSecond: 125 },
          'worker2': { hashrate: 750000000, sharesPerSecond: 187.5 },
        }
      },
      pendingShares: 125,
      pendingBalance: 0.00125,
      totalPaid: 12.5,
      todayPaid: 0.125
    };
  },
  getPools: async () => {
    try {
      const response = await fetch(`${siteConfig.api.baseUrl}/pools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pools:', error);
      return [];
    }
  },
  getPoolById: async (poolId: string) => {
    try {
      const pools = await fetch(`${siteConfig.api.baseUrl}/pools`);
      const poolsData = await pools.json();
      return poolsData.find((pool: any) => pool.id === poolId) || null;
    } catch (error) {
      console.error('Error fetching pool by ID:', error);
      return null;
    }
  }
};
