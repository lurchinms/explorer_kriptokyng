declare module '@/config/blocktime' {
  export interface BlockTimeConfig {
    symbol: string;
    name: string;
    blockTime: number;
    difficultyAdjustmentPeriod?: number;
  }

  export function getBlockTime(symbol: string): number;
  export function getBlockTimeConfig(symbol: string): BlockTimeConfig | null;
  export function getAllBlockTimes(): Record<string, BlockTimeConfig>;
}
