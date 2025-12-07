"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Search, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoinIcon } from "@/components/ui/coin-icon";
import {
  formatNumber,
  formatHashrate,
  formatCurrency,
} from "@/lib/utils/format";
import { useWebSocket } from "@/contexts/websocket-context";
import { useLiveData } from "@/contexts/live-data-context";
import { useLanguage } from "@/contexts/language-context";

interface Pool {
  id: string;
  coin: {
    symbol: string;
    name: string;
    algorithm: string;
  };
  poolStats?: {
    poolHashrate?: number;
    connectedMiners?: number;
  };
  paymentProcessing: {
    payoutScheme: string;
  };
  poolFeePercent: number;
  totalPaid: number;
  totalBlocks: number;
}

interface PoolTableProps {
  pools: Pool[];
}

interface PoolHashrates {
  [poolId: string]: number;
}

interface RecentActivity {
  [poolId: string]: {
    type: "block" | "payment";
    message: string;
    timestamp: Date;
  };
}

export function LivePoolTable({ pools: initialPools }: PoolTableProps) {
  const { t } = useLanguage();
  const { isConnected } = useWebSocket();
  const { pools, poolHashrates, recentEvents, lastApiUpdate, isRefreshing } =
    useLiveData();
  const [sortColumn, setSortColumn] = useState("miners");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  // Convert recentEvents to activity format for compatibility
  const recentActivity: RecentActivity = {};
  // This would need to be adapted based on how events are structured in the central context

  // Update pools with live data
  const updatedPools = pools.map((pool) => ({
    ...pool,
    poolStats: {
      ...pool.poolStats,
      poolHashrate: poolHashrates[pool.id] ?? pool.poolStats?.poolHashrate ?? 0,
    },
  }));

  function getSortValue(pool: Pool, column: string) {
    switch (column) {
      case "coin":
        return pool.coin.name;
      case "type":
        return pool.paymentProcessing.payoutScheme;
      case "algorithm":
        return pool.coin.algorithm;
      case "fee":
        return pool.poolFeePercent;
      case "miners":
        return pool.poolStats?.connectedMiners || 0;
      case "hashrate":
        return pool.poolStats?.poolHashrate || 0;
      case "blocks":
        return pool.totalBlocks || 0;
      case "paid":
        return pool.totalPaid || 0;
      default:
        return "";
    }
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  function SortIcon({
    active,
    direction,
  }: {
    active: boolean;
    direction: "asc" | "desc";
  }) {
    return active ? (
      direction === "asc" ? (
        <span>▲</span>
      ) : (
        <span>▼</span>
      )
    ) : (
      <span className="opacity-30">▲</span>
    );
  }

  // Filter pools by search
  const filteredPools = updatedPools.filter((pool) => {
    const q = search.toLowerCase();
    return (
      pool.coin.name.toLowerCase().includes(q) ||
      pool.coin.symbol.toLowerCase().includes(q) ||
      pool.coin.algorithm.toLowerCase().includes(q) ||
      pool.paymentProcessing.payoutScheme.toLowerCase().includes(q)
    );
  });

  // Sort filtered pools
  const sortedPools = [...filteredPools].sort((a, b) => {
    const aValue = getSortValue(a, sortColumn);
    const bValue = getSortValue(b, sortColumn);
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full mt-4">
      {/* Header with connection status and search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span>
              {isConnected ? t("pools.liveData") : t("pools.offlineStatus")}
              {" • "}
              {t("pools.updated")}{" "}
              {lastApiUpdate?.toLocaleTimeString() || t("common.na")}
              {isRefreshing && (
                <span className="text-blue-500 ml-2">
                  {t("pools.refreshing")}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="relative max-w-md w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("pools.searchByCoinOrAlgo")}
            className="pl-12 pr-4 py-2 rounded-full bg-muted border-none w-full text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <table className="w-full bg-card/80 rounded-xl border border-border/30 shadow divide-y divide-border">
        <thead>
          <tr>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("coin")}
              >
                {t("pools.coin")}{" "}
                <SortIcon
                  active={sortColumn === "coin"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden md:table-cell">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("type")}
              >
                {t("pools.type")}{" "}
                <SortIcon
                  active={sortColumn === "type"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden lg:table-cell">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("algorithm")}
              >
                {t("pools.algorithm")}{" "}
                <SortIcon
                  active={sortColumn === "algorithm"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden lg:table-cell">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("fee")}
              >
                {t("pools.fee")}{" "}
                <SortIcon
                  active={sortColumn === "fee"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("miners")}
              >
                {t("pools.miners")}{" "}
                <SortIcon
                  active={sortColumn === "miners"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("hashrate")}
              >
                {t("pools.hashrate")}{" "}
                <SortIcon
                  active={sortColumn === "hashrate"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden xl:table-cell">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("blocks")}
              >
                {t("pools.blocks")}{" "}
                <SortIcon
                  active={sortColumn === "blocks"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden xl:table-cell whitespace-nowrap">
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("paid")}
              >
                {t("pools.totalPaid")}{" "}
                <SortIcon
                  active={sortColumn === "paid"}
                  direction={sortDirection}
                />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {sortedPools.map((pool) => {
            const hasLiveHashrate = poolHashrates[pool.id] !== undefined;
            const activity = recentActivity[pool.id];

            return (
              <tr key={pool.id} className="hover:bg-muted/40 transition">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <CoinIcon
                      symbol={pool.coin.symbol}
                      name={pool.coin.name}
                      size={32}
                      className="min-w-[32px]"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-foreground">
                          {pool.coin.name}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({pool.coin.symbol})
                          </span>
                        </span>
                        {hasLiveHashrate && (
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      {activity && (
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              activity.type === "block"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {activity.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden md:table-cell">
                  {pool.paymentProcessing.payoutScheme}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden lg:table-cell">
                  {pool.coin.algorithm}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden lg:table-cell">
                  {pool.poolFeePercent}%
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base font-semibold">
                  {formatNumber(pool.poolStats?.connectedMiners || 0, 0)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base font-semibold">
                  <div className="flex items-center gap-2">
                    {formatHashrate(pool.poolStats?.poolHashrate || 0)}
                    {hasLiveHashrate && (
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base font-semibold hidden xl:table-cell">
                  {formatNumber(pool.totalBlocks || 0, 0)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base font-semibold hidden xl:table-cell">
                  {formatCurrency(pool.totalPaid || 0)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  {/* Desktop: Full button */}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hidden md:inline-flex"
                  >
                    <Link href={`/pools/${pool.id}`}>
                      {t("pools.viewDetails")}
                    </Link>
                  </Button>
                  {/* Mobile: Arrow icon only */}
                  <Link
                    href={`/pools/${pool.id}`}
                    className="inline-flex md:hidden items-center justify-center p-2 rounded hover:bg-muted transition"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sortedPools.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t("pools.noPoolsFound")}
        </div>
      )}
    </div>
  );
}
