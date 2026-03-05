import { ReactNode } from "react";

export interface MinerStats {
  hashrate: number;
  shares: number;
  lastSeen: string;
  performance?: {
    daily: number;
    weekly: number;
    monthly: number;
    workers?: Record<string, {
      hashrate: number;
      sharesPerSecond: number;
    }>;
  };
  pendingShares?: number;
  pendingBalance?: number;
  totalPaid?: number;
  todayPaid?: number;
  totalPendingBlocks?: number;
  totalConfirmedBlocks?: number;
}

export interface MinerStatsSummary {
  totalHashrate: number;
  totalShares: number;
  workersCount: number;
}

export interface MinerPayment {
  id: string;
  amount: number;
  timestamp: string;
  txid?: string;
  status: 'pending' | 'confirmed' | 'paid';
}

export interface HashrateHistoryPoint {
  timestamp: number;
  hashrate: number;
  sharesPerSecond: number;
  dataPoints: number;
  created: string;
}

export interface WorkerPerformanceData {
  timestamp: number;
  worker: string;
  hashrate: number;
  sharesPerSecond: number;
  dataPoints: number;
  created: string;
}

export interface PoolData {
  clientConnectionTimeout: ReactNode;
  blockRefreshInterval: ReactNode;
  poolEffort: number;
  networkStats: any;
  ports(ports: any): unknown;
  address: ReactNode;
  lastPoolBlockTime: any;
  id: string;
  name: string;
  coin: {
    name: string;
    type: string;
    symbol: string;
    algorithm?: string;
    website?: string;
    market?: string;
  };
  paymentProcessing: {
    payoutSchemeConfig: any;
    minimumPayment: ReactNode;
    payoutScheme: 'pplns' | 'pps' | 'solo';
  };
  stats?: {
    hashrate: number;
    miners: number;
    workers: number;
    blocksPerDay: number;
  };
  poolStats?: {
    poolHashrate?: number;
    connectedMiners?: number;
  };
  totalBlocks?: number;
  totalConfirmedBlocks?: number;
  totalPendingBlocks?: number;
  poolFeePercent?: number;
  totalPaid?: number;
  blockReward?: number;
  stratumServers?: Record<string, any>;
  addressInfoLink?: string;
}

export interface MinerCheckResponse {
  exists: boolean;
  address?: string;
  poolId?: string;
  stats?: MinerStats;
}

export interface BlockData {
  id: string;
  height: number;
  timestamp: string;
  reward: number;
  confirmations: number;
  miner: string;
  difficulty?: number;
  size?: number;
}

export interface PoolStats {
  poolId: string;
  hashrate: number;
  miners: number;
  workers: number;
  blocksPerDay: number;
  totalShares: number;
  luck?: number;
  fee?: number;
}

export interface NetworkStats {
  difficulty: number;
  hashrate: number;
  blockHeight: number;
  blockTime: number;
  reward: number;
  lastBlock?: {
    height: number;
    timestamp: string;
    hash: string;
  };
}

export interface StratumServer {
  host: string;
  port: number;
  protocol: 'stratum' | 'stratum+ssl' | 'stratum+tcp';
  difficulty: number;
  connections: number;
}

// Type alias for backward compatibility
export type Pool = PoolData;
