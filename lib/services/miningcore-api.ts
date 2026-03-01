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
  getMinerStats: async (address: string) => {
    // Mock implementation
    return {
      hashrate: 1250000000,
      shares: 12500,
      lastSeen: new Date().toISOString()
    };
  }
};
