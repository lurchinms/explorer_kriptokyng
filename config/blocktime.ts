// Block time configurations for different cryptocurrencies
// These are average block times in seconds

export interface BlockTimeConfig {
  symbol: string;
  name: string;
  blockTime: number; // in seconds
  difficultyAdjustmentPeriod?: number; // in blocks
}

const blockTimes: Record<string, BlockTimeConfig> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    blockTime: 600, // 10 minutes
    difficultyAdjustmentPeriod: 2016 // ~2 weeks
  },
  BCH: {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    blockTime: 600, // 10 minutes
    difficultyAdjustmentPeriod: 2016
  },
  LTC: {
    symbol: 'LTC',
    name: 'Litecoin',
    blockTime: 150, // 2.5 minutes
    difficultyAdjustmentPeriod: 2016
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    blockTime: 12, // ~12 seconds (post-merge)
    difficultyAdjustmentPeriod: 1
  },
  ETC: {
    symbol: 'ETC',
    name: 'Ethereum Classic',
    blockTime: 13, // ~13 seconds
    difficultyAdjustmentPeriod: 1
  },
  ZEC: {
    symbol: 'ZEC',
    name: 'Zcash',
    blockTime: 75, // 1.25 minutes
    difficultyAdjustmentPeriod: 1
  },
  DASH: {
    symbol: 'DASH',
    name: 'Dash',
    blockTime: 155, // ~2.58 minutes
    difficultyAdjustmentPeriod: 1
  },
  DOGE: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    blockTime: 60, // 1 minute
    difficultyAdjustmentPeriod: 1
  },
  RVN: {
    symbol: 'RVN',
    name: 'Ravencoin',
    blockTime: 60, // 1 minute
    difficultyAdjustmentPeriod: 1
  },
  KAS: {
    symbol: 'KAS',
    name: 'Kaspa',
    blockTime: 1, // 1 second (blockDAG)
    difficultyAdjustmentPeriod: 1
  }
};

export function getBlockTime(symbol: string): number {
  const config = blockTimes[symbol.toUpperCase()];
  return config?.blockTime || 600; // Default to 10 minutes (600 seconds) if not found
}

export function getBlockTimeConfig(symbol: string): BlockTimeConfig | null {
  return blockTimes[symbol.toUpperCase()] || null;
}

export function getAllBlockTimes(): Record<string, BlockTimeConfig> {
  return blockTimes;
}

export default blockTimes;
