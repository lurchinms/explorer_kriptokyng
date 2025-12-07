"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoinIcon } from "@/components/ui/coin-icon";
import { useWebSocket } from "@/contexts/websocket-context";
import { useLiveData } from "@/contexts/live-data-context";
import { formatHashrate, formatNumber, formatCurrency } from "@/lib/utils/format";
import { useLanguage } from "@/contexts/language-context";

interface Pool {
  id: string;
  coin: {
    symbol: string;
    name: string;
    algorithm: string;
  };
  poolStats?: {
    poolHashrate: number;
    connectedMiners: number;
  };
  paymentProcessing: {
    payoutScheme: string;
  };
  totalPaid: number;
  totalBlocks: number;
}

interface LiveStatsCardProps {
  initialPools: Pool[];
  initialTotalMiners: number;
  initialTotalHashrate: number;
  initialTotalPaid: number;
}

interface PoolHashrates {
  [poolId: string]: number;
}

export function LiveStatsCard({ 
  initialPools, 
  initialTotalMiners, 
  initialTotalHashrate, 
  initialTotalPaid 
}: LiveStatsCardProps) {
  const { t } = useLanguage();
  const { isConnected } = useWebSocket();
  const { pools, poolHashrates, recentEvents, lastApiUpdate, isRefreshing } = useLiveData();

  // Update pools with live hashrate data
  const updatedPools = pools.map(pool => ({
    ...pool,
    poolStats: {
      ...pool.poolStats,
      poolHashrate: poolHashrates[pool.id] ?? pool.poolStats?.poolHashrate ?? 0
    }
  }));

  // Calculate live totals
  const liveHashrateFromWS = Object.values(poolHashrates).reduce((sum, rate) => sum + rate, 0);
  const totalHashrate = liveHashrateFromWS > 0 ? liveHashrateFromWS : initialTotalHashrate;
  const totalMiners = updatedPools.reduce((sum, pool) => sum + (pool.poolStats?.connectedMiners || 0), 0);

  // Get top 3 pools by hashrate
  const topPools = updatedPools
    .sort((a, b) => (b.poolStats?.poolHashrate || 0) - (a.poolStats?.poolHashrate || 0))
    .slice(0, 3);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <motion.div 
      className="relative"
      variants={cardVariants}
    >
      <div className="relative bg-background/80 dark:bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-secondary/3 dark:from-primary/5 dark:to-secondary/5 rounded-2xl" />
        <div className="relative z-10 space-y-3">
          {/* Header with Connection Status */}
          <div className="text-center flex items-center justify-center gap-2">
            <h3 className="text-lg font-semibold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {t("home.liveStats.title")}
            </h3>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          </div>
          
          <div className="text-sm text-muted-foreground text-center">
            {isConnected ? (
              <span>
                {t("home.liveStats.liveUpdates")} • {t("home.liveStats.last")}: {lastApiUpdate?.toLocaleTimeString() || t("common.na")}
                {isRefreshing && (
                  <span className="text-blue-500 ml-2">{t("home.liveStats.updating")}</span>
                )}
              </span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400">
                {t("home.liveStats.wsDisconnected")} • {t("home.liveStats.lastApi")}: {lastApiUpdate?.toLocaleTimeString() || t("common.na")}
              </span>
            )}
          </div>

          
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/60 dark:to-muted/30 rounded-xl border border-border/40 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{pools.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("home.liveStats.pools")}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/60 dark:to-muted/30 rounded-xl border border-border/40 shadow-sm">
              <div className="text-3xl font-bold text-foreground">{formatNumber(totalMiners, 0)}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("home.liveStats.miners")}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/60 dark:to-muted/30 rounded-xl border border-border/40 shadow-sm">
              <div className="text-2xl font-bold text-foreground">{formatHashrate(totalHashrate)}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("home.liveStats.hashrate")}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/60 dark:to-muted/30 rounded-xl border border-border/40 shadow-sm">
              <div className="text-2xl font-bold text-foreground">{formatCurrency(initialTotalPaid)}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("home.liveStats.paid")}</div>
            </div>
          </div>
          
          {/* Top Pools Section */}
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">{t("home.liveStats.topPools")}</h4>
              <span className="text-xs text-muted-foreground">{pools.length} {t("home.liveStats.available")}</span>
            </div>
            <div className="space-y-2">
              {topPools.map((pool, index) => {
                const hasLiveData = poolHashrates[pool.id] !== undefined;
                return (
                  <div key={pool.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-muted/15 dark:from-muted/40 dark:to-muted/20 rounded-xl border border-border/30 hover:from-muted/40 hover:to-muted/25 dark:hover:from-muted/50 dark:hover:to-muted/30 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary/15 to-primary/8 dark:from-primary/20 dark:to-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <CoinIcon 
                          symbol={pool.coin.symbol} 
                          name={pool.coin.name} 
                          size={18} 
                        />
                        <div>
                          <div className="text-sm font-medium flex items-center gap-2">
                            {pool.coin.symbol}
                            <span className="text-xs text-muted-foreground bg-muted/60 rounded px-2 py-0.5 border border-border/30 ml-1">
                              {pool.paymentProcessing.payoutScheme}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">{pool.coin.algorithm}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatHashrate(pool.poolStats?.poolHashrate || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(pool.poolStats?.connectedMiners || 0, 0)} {t("home.liveStats.minersSuffix")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="sm" asChild className="w-full border-2 hover:bg-muted/50 dark:hover:bg-muted/30">
              <Link href="/pools">{t("home.liveStats.browseAllPools")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
