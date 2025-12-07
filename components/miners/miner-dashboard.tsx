"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHashrate, formatNumber } from "@/lib/utils/format";
import { getBlockTime } from "@/config/blocktime";
import { MinerStats } from "@/lib/types/miningcore";
import { Loader2, ActivityIcon, LineChart, Coins, Blocks, Receipt, Clock, HelpCircle } from "lucide-react";
import { MinerPerformanceCharts } from "./miner-performance-charts";
import { MinerEarningsChart } from "./miner-earnings-chart";
import { MinerPayments } from "./miner-payments";
import { MinerBlocks } from "./miner-blocks";
import { MinerHashrateChart } from "./miner-hashrate-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePool } from "@/lib/hooks/use-miningcore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMinerPerformance, useMinerContributedBlocks } from "@/lib/hooks/use-miningcore"; // Add this with other hook imports
import { useCryptoPrice } from "@/lib/hooks/use-crypto-price"; // Import the CryptoPrice interface
import { useLanguage } from "@/contexts/language-context";

// First, fix the formatTimeToFind function to show seconds when < 1 minute
function formatTimeToFind(timeInSeconds: number): string {
  if (timeInSeconds === Infinity || isNaN(timeInSeconds)) {
    return "∞";
  }

  const days = Math.floor(timeInSeconds / (24 * 3600));
  timeInSeconds %= (24 * 3600);
  const hours = Math.floor(timeInSeconds / 3600);
  timeInSeconds %= 3600;
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

interface MinerDashboardProps {
  stats: MinerStats;
  poolId: string;
  address: string;
  coinSymbol: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: number;
}

export function MinerDashboard({
  stats,
  poolId,
  address,
  coinSymbol: propCoinSymbol,
  isLoading
}: MinerDashboardProps) {
  const { t } = useLanguage();
  // Fetch pool data to get blockReward information
  const { data: poolData } = usePool(poolId, {
    refetchOnMount: false, // Don't refetch on mount to prevent disruption
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent disruption
  });

  const { data: performanceData = [] } = useMinerPerformance(poolId, address);

  // Get contributed blocks to calculate accurate pending rewards
  const { data: contributedBlocks = [] } = useMinerContributedBlocks(poolId, address);

  // Get coin symbol directly from pool data instead of relying on props
  const coinSymbol = poolData?.coin?.symbol || propCoinSymbol || "";

  // Fetch price data for the coin
  const { data: priceData } = useCryptoPrice(coinSymbol, poolId);

  // Add a check to see if we're still loading price data
  const isPriceLoading = !priceData && coinSymbol;

  // Log for debugging
  React.useEffect(() => {
    if (priceData) {
      console.log(`Price data for ${coinSymbol}:`, priceData);
    }
  }, [priceData, coinSymbol]);

  // Helper function to calculate average hashrate from samples
  interface WorkerStats {
    hashrate: number;
  }

  interface PerformanceSample {
    created: string;
    workers: Record<string, WorkerStats>;
  }

  const calculateAverageHashrate = React.useCallback((samples: PerformanceSample[]): number => {
    if (samples.length === 0) return 0;
    
    let totalHashrate = 0;
    for (const sample of samples) {
      let sampleHashrate = 0;
      for (const workerName in sample.workers) {
        sampleHashrate += sample.workers[workerName].hashrate || 0;
      }
      totalHashrate += sampleHashrate;
    }
    
    return totalHashrate / samples.length;
  }, []);
  
  // Calculate recent earnings statistics - wrapped in useCallback
  const calculateRecentStats = React.useCallback(() => {
    // Default empty values
    const defaultStats = {
      fourHour: { hashrate: 0, earnings: 0 },
      twelveHour: { hashrate: 0, earnings: 0 },
      twentyFourHour: { hashrate: 0, earnings: 0 }
    };
  
    if (!performanceData || performanceData.length === 0 || !stats) {
      return defaultStats;
    }
  
    const now = new Date().getTime();
    const fourHoursAgo = now - (4 * 60 * 60 * 1000);
    const twelveHoursAgo = now - (12 * 60 * 60 * 1000);
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
    // Get samples for different time periods
    const fourHourSamples = [];
    const twelveHourSamples = [];
    const twentyFourHourSamples = [];
  
    // Filter performance samples by time periods
    for (const sample of performanceData) {
      const sampleTime = new Date(sample.created).getTime();
      
      if (sampleTime >= twentyFourHoursAgo) {
        twentyFourHourSamples.push(sample);
        
        if (sampleTime >= twelveHoursAgo) {
          twelveHourSamples.push(sample);
          
          if (sampleTime >= fourHoursAgo) {
            fourHourSamples.push(sample);
          }
        }
      }
    }
  
    // Calculate average hashrate for each period
    const fourHourHashrate = calculateAverageHashrate(fourHourSamples);
    const twelveHourHashrate = calculateAverageHashrate(twelveHourSamples);
    const twentyFourHourHashrate = calculateAverageHashrate(twentyFourHourSamples);
  
    // Calculate earnings based on hashrate share of total rewards
    // This is an estimation based on current reward rate
    const dailyReward = stats.todayPaid || (stats.totalPaid / 30); // Fallback to average if today's paid is not available
    
    const fourHourEarnings = dailyReward * (4 / 24);
    const twelveHourEarnings = dailyReward * (12 / 24);
    const twentyFourHourEarnings = dailyReward;
  
    return {
      fourHour: { hashrate: fourHourHashrate, earnings: fourHourEarnings },
      twelveHour: { hashrate: twelveHourHashrate, earnings: twelveHourEarnings },
      twentyFourHour: { hashrate: twentyFourHourHashrate, earnings: twentyFourHourEarnings }
    };
  }, [performanceData, stats, calculateAverageHashrate]);

  // Get the recent statistics - MOVED BEFORE ANY CONDITIONAL RETURNS
  const recentStats = React.useMemo(() => {
    return calculateRecentStats();
  }, [calculateRecentStats]); // Only depends on the memoized function now

  // Calculate estimated pending rewards from blocks - MOVED BEFORE CONDITIONAL RETURNS
  const estimatedPendingBlockRewards = React.useMemo(() => {
    const blockReward = poolData?.blockReward || 0;
    const pendingBlocksCount = stats.totalPendingBlocks || 0;
    
    if (!contributedBlocks || contributedBlocks.length === 0) {
      // Fallback to simple calculation if no contributed blocks data
      return blockReward * pendingBlocksCount;
    }
    
    // Sum up estimated shares from pending blocks
    return contributedBlocks
      .filter((block: any) => block.status === "pending")
      .reduce((sum: number, block: any) => {
        const reward = parseFloat(block.reward) || blockReward;
        const contribution = block.minerContribution || 0;
        return sum + (reward * (contribution / 100));
      }, 0);
  }, [contributedBlocks, poolData?.blockReward, stats.totalPendingBlocks]);

  // Count actual immature blocks the miner contributed to - using real block status, not API fallback
  const actualImmatureBlocksCount = React.useMemo(() => {
    if (!contributedBlocks || contributedBlocks.length === 0) {
      return 0; // No blocks data means 0 immature blocks, not API fallback
    }
    
    return contributedBlocks.filter((block: any) => block.status === "pending").length;
  }, [contributedBlocks]);

  // Recalculate recent stats with updated earnings including pending rewards
  const recentStatsWithPending = React.useMemo(() => {
    // Calculate earnings based on actual paid + estimated pending rewards
    const totalEarningsIncludingPending = (stats.totalPaid || 0) + (estimatedPendingBlockRewards || 0);
    const dailyReward = stats.todayPaid || (totalEarningsIncludingPending / 30);
    
    return {
      fourHour: { hashrate: recentStats.fourHour.hashrate, earnings: dailyReward * (4 / 24) },
      twelveHour: { hashrate: recentStats.twelveHour.hashrate, earnings: dailyReward * (12 / 24) },
      twentyFourHour: { hashrate: recentStats.twentyFourHour.hashrate, earnings: dailyReward }
    };
  }, [recentStats, stats.totalPaid, stats.todayPaid, estimatedPendingBlockRewards]);

  // Now we can have the conditional return - use the passed isLoading prop
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Get the latest performance data directly from stats.performance
  const currentPerformance = stats.performance || null;

  // Get worker details from performance object
  const activeWorkers = currentPerformance?.workers || {};
  
  // Filter worker names to only those with non-zero hashrate
  const activeWorkerNames = Object.entries(activeWorkers)
    .filter(([, worker]) => worker.hashrate > 0)
    .map(([name]) => name);

  // Calculate total current hashrate by summing all worker hashrates
  const totalCurrentHashrate = Object.values(activeWorkers).reduce((sum, worker) => {
    return sum + (worker?.hashrate || 0);
  }, 0);

  // Total pending balance (from shares + estimated block rewards)
  const totalPendingBalance = stats.pendingBalance + estimatedPendingBlockRewards;

  // Detect mining scheme
  const isSharedMining = poolData?.paymentProcessing?.payoutScheme && 
    !["SOLO"].includes(poolData.paymentProcessing.payoutScheme);

  // Calculate Time To Find (TTF) - estimated time to find a block
  const networkHashrate = poolData?.networkStats?.networkHashrate || 0;
  const networkDifficulty = poolData?.networkStats?.networkDifficulty || 0;
  const poolHashrate = poolData?.poolStats?.poolHashrate || 1; // Prevent division by zero

  let soloTTF = 0;
  let poolTTF = 0;
  let userShareTTF = 0;

  if (totalCurrentHashrate > 0 && networkHashrate > 0 && networkDifficulty > 0) {
    try {
      
      // Alternative TTF calculation based on network share
      const blockTime = getBlockTime(coinSymbol); // Get block time from config
      
      // Calculate your share of network hashrate
      const yourNetworkShare = totalCurrentHashrate / networkHashrate;
      const poolNetworkShare = poolHashrate / networkHashrate;
      
      // TTF = Block Time / Your Share of Network
      soloTTF = blockTime / yourNetworkShare;
      poolTTF = blockTime / poolNetworkShare;
      
      // Calculate your contribution to pool blocks (how often you contribute)
      const userShareOfPool = totalCurrentHashrate / poolHashrate;
      userShareTTF = poolTTF / userShareOfPool;
      
      // Apply sanity checks
      if (soloTTF > 31536000000 || !isFinite(soloTTF)) soloTTF = Infinity;
      if (poolTTF > 31536000000 || !isFinite(poolTTF)) poolTTF = Infinity;
      if (userShareTTF > 31536000000 || !isFinite(userShareTTF)) userShareTTF = Infinity;
      
    } catch (error) {
      soloTTF = Infinity;
      poolTTF = Infinity;
      userShareTTF = Infinity;
    }
  }

  // Format the TTF values for display
  const soloTimeToFind = formatTimeToFind(soloTTF);
  const poolTimeToFind = formatTimeToFind(poolTTF);
  const userShareTimeToFind = formatTimeToFind(userShareTTF);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Current Hashrate Card */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">{t('minerDashboard.currentHashrate')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold">
                {formatHashrate(totalCurrentHashrate)}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeWorkerNames.length} {activeWorkerNames.length !== 1 ? t('minerDashboard.activeWorkersPlural') : t('minerDashboard.activeWorkers')}
                </span>
              </div>
            </CardContent>
          </Card>

                        {/* Unpaid Card - Simplified */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('minerDashboard.unpaid')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      <p>{t('minerDashboard.confirmedUnpaid')}: {formatNumber(stats.pendingBalance)} {coinSymbol}</p>
                      <p>{t('minerDashboard.pendingBlocks')}: {formatNumber(estimatedPendingBlockRewards)} {coinSymbol}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {formatNumber(stats.pendingBalance + estimatedPendingBlockRewards)}
                <sup className="text-xs font-medium text-muted-foreground">{coinSymbol}</sup>
                {priceData && priceData.price !== null && (
                  <span className="text-sm text-green-500 ml-1">
                    (${formatNumber((stats.pendingBalance + estimatedPendingBlockRewards) * priceData.price, 2)})
                  </span>
                )}
              </div>
              {(stats.totalPendingBlocks > 0 || estimatedPendingBlockRewards > 0) && (
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(estimatedPendingBlockRewards)} {coinSymbol} ({formatNumber(actualImmatureBlocksCount, 0)} {t('minerDashboard.immature')})
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Paid Card - Simplified */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('minerDashboard.totalPaid')}</CardTitle>
                {stats.todayPaid > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="flex items-center">
                        {t('minerDashboard.today')}: {formatNumber(stats.todayPaid)}
                        <sup className="text-xs">{coinSymbol}</sup>
                        {priceData && priceData.price !== null && (
                          <span className="text-sm text-green-500 ml-1">
                            (${formatNumber(stats.todayPaid * priceData.price, 2)})
                          </span>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {formatNumber(stats.totalPaid)}
                <sup className="text-xs font-medium text-muted-foreground">{coinSymbol}</sup>
                {priceData && priceData.price !== null && (
                  <span className="text-sm text-green-500 ml-1">
                    (${formatNumber(stats.totalPaid * priceData.price, 2)})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Blocks className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatNumber(stats.totalConfirmedBlocks || 0, 0)} {t('minerDashboard.confirmedBlocks')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actual Earnings Card - Redesigned for consistency */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('minerDashboard.actualEarnings')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {t('minerDashboard.averageHashrateEarnings')}
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{t('minerDashboard.fourHours')}</div>
                  <div className="flex items-center gap-1">
                    <div className="text-xs text-muted-foreground">{formatHashrate(recentStatsWithPending.fourHour.hashrate)}</div>
                    <div className="text-sm font-bold flex items-center">
                      {formatNumber(recentStatsWithPending.fourHour.earnings)}
                      <sup className="text-xs font-medium text-muted-foreground">{coinSymbol}</sup>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{t('minerDashboard.twelveHours')}</div>
                  <div className="flex items-center gap-1">
                    <div className="text-xs text-muted-foreground">{formatHashrate(recentStatsWithPending.twelveHour.hashrate)}</div>
                    <div className="text-sm font-bold flex items-center">
                      {formatNumber(recentStatsWithPending.twelveHour.earnings)}
                      <sup className="text-xs font-medium text-muted-foreground">{coinSymbol}</sup>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{t('minerDashboard.twentyFourHours')}</div>
                  <div className="flex items-center gap-1">
                    <div className="text-xs text-muted-foreground">{formatHashrate(recentStatsWithPending.twentyFourHour.hashrate)}</div>
                    <div className="text-sm font-bold flex items-center">
                      {formatNumber(recentStatsWithPending.twentyFourHour.earnings)}
                      <sup className="text-xs font-medium text-muted-foreground">{coinSymbol}</sup>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time To Find (TTF) Card - Simplified */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('minerDashboard.timeToFind')}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span>{t('minerDashboard.soloMiningEstimate')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ActivityIcon className="h-4 w-4" />
                      <span>{t('minerDashboard.yourRewardFrequency')}: {userShareTimeToFind}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{t('minerDashboard.contribution')}: {((totalCurrentHashrate / poolHashrate) * 100).toFixed(2)}% of pool</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isSharedMining ? poolTimeToFind : soloTimeToFind}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('minerDashboard.poolBlock')}: {poolTimeToFind}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* ALPH Price card removed */}
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full flex justify-start overflow-x-auto mb-6">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span>{t('minerDashboard.stats')}</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span>{t('minerDashboard.earnings')}</span>
            </TabsTrigger>
            <TabsTrigger value="blocks" className="flex items-center gap-2">
              <Blocks className="h-4 w-4" />
              <span>{t('minerDashboard.blocks')}</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>{t('minerDashboard.payments')}</span>
            </TabsTrigger>
            </TabsList>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-8">
            {/* Hashrate Chart */}
            <MinerHashrateChart poolId={poolId} address={address} />
            
            {/* Performance Chart with worker details */}
            <MinerPerformanceCharts
              poolId={poolId}
              address={address}
              activeWorkers={activeWorkers}
              workerNames={activeWorkerNames}  // Use the filtered list here
            />
          </TabsContent>
          
          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-8">
            <MinerEarningsChart
              poolId={poolId}
              address={address}
              coinSymbol={coinSymbol}
            />
          </TabsContent>
          
          {/* Blocks Tab */}
          <TabsContent value="blocks">
            <MinerBlocks 
              poolId={poolId} 
              address={address} 
              coinSymbol={coinSymbol} 
            />
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments">
            <MinerPayments
              poolId={poolId}
              address={address}
              coinSymbol={coinSymbol}
            />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}