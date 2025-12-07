"use client";

import React, { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { formatHashrate } from "@/lib/utils/format";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface MinerHashrateChartProps {
  poolId: string;
  address: string;
}

interface HashrateData {
  timestamp: number;
  hashrate: number;
  sharesPerSecond: number;
  dataPoints: number;
  created: string;
}

interface PoolHashrateData {
  timestamp: number;
  poolHashrate: number;
  connectedMiners: number;
  sharesPerSecond: number;
  networkHashrate: number;
  networkDifficulty: number;
  dataPoints: number;
  created: string;
}

interface ChartData {
  date: string;
  timestamp: number;
  minerHashrate: number;
  poolHashrate: number | null;
}

// Time period configurations
const TIME_PERIODS = {
  '24h': { hours: 24, interval: '1m', labelKey: 'minerPerformance.timePeriods.hours24' },
  'week': { hours: 168, interval: '5m', labelKey: 'minerPerformance.timePeriods.week' },
  'month': { hours: 720, interval: '30m', labelKey: 'minerPerformance.timePeriods.month' },
  'all': { hours: 8760, interval: '1d', labelKey: 'minerHashrate.allTime' }
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;

export function MinerHashrateChart({ poolId, address }: MinerHashrateChartProps) {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24h');
  const [minerData, setMinerData] = useState<HashrateData[]>([]);
  const [poolData, setPoolData] = useState<PoolHashrateData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for both miner and pool
  const fetchData = React.useCallback(async (period: TimePeriod) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { hours, interval } = TIME_PERIODS[period];
      
      // Fetch miner hashrate data
      const minerResponse = await fetch(
        `/api/miners/${encodeURIComponent(poolId)}/${encodeURIComponent(address)}/hashrate-history?hours=${hours}&interval=${interval}&limit=1000`
      );
      
      if (!minerResponse.ok) {
        throw new Error(t('minerHashrate.failedToFetchMiner'));
      }
      
      const minerResult = await minerResponse.json();
      
      // Fetch pool hashrate data
      const poolResponse = await fetch(
        `/api/pools/${poolId}/hashrate-history?hours=${hours}&interval=${interval}&limit=1000`
      );
      
      if (!poolResponse.ok) {
        throw new Error(t('minerHashrate.failedToFetchPool'));
      }
      
      const poolResult = await poolResponse.json();
      
      setMinerData(minerResult.data || []);
      setPoolData(poolResult.data || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setMinerData([]);
      setPoolData([]);
    } finally {
      setIsLoading(false);
    }
  }, [poolId, address]);

  // Load data when component mounts or period changes
  React.useEffect(() => {
    fetchData(selectedPeriod);
  }, [selectedPeriod, fetchData]);

  // Process data for the chart
  const processedData = React.useMemo((): ChartData[] => {
    if (!minerData.length) return [];
    
    // Create a map of pool data by timestamp for efficient lookup
    const poolDataMap = new Map<number, number>();
    poolData.forEach(point => {
      poolDataMap.set(point.timestamp, point.poolHashrate);
    });
    
    // Process miner data and match with pool data
    return minerData.map(point => {
      // Find closest pool data point by timestamp
      let closestPoolHashrate: number | null = null;
      let minTimeDiff = Infinity;
      
      poolData.forEach(poolPoint => {
        const timeDiff = Math.abs(point.timestamp - poolPoint.timestamp);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestPoolHashrate = poolPoint.poolHashrate;
        }
      });
      
      return {
        date: point.created,
        timestamp: point.timestamp,
        minerHashrate: point.hashrate,
        poolHashrate: closestPoolHashrate,
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }, [minerData, poolData]);

  // Calculate latest values and percentages for the summary
  const latestData = processedData[processedData.length - 1];
  const latestMinerHashrate = latestData?.minerHashrate || 0;
  const latestPoolHashrate = latestData?.poolHashrate || 1;
  const minerPercentage = latestPoolHashrate > 0 ? ((latestMinerHashrate / latestPoolHashrate) * 100).toFixed(2) : '0.00';

  // Chart configuration
  const chartConfig = {
    hashrate: {
      label: t('minerHashrate.hashrate'),
    },
    minerHashrate: {
      label: t('minerHashrate.yourHashrate'),
      color: "#2563eb",
      valueFormatter: (value: number) => formatHashrate(value),
    },
    poolHashrate: {
      label: t('minerHashrate.poolHashrate'),
      color: "#10b981",
      valueFormatter: (value: number) => formatHashrate(value),
    },
  } as ChartConfig;

  // Format X-axis labels based on time period
  const formatXAxisLabel = (dateString: string) => {
    const date = new Date(dateString);
    const period = TIME_PERIODS[selectedPeriod];
    
    if (period.hours <= 24) {
      // For 24h, show time
      return date.toLocaleDateString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (period.hours <= 168) {
      // For week, show day and time
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      });
    } else {
      // For month and all time, show date
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('minerHashrate.title')}</CardTitle>
          <CardDescription>{t('minerHashrate.loading')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('minerHashrate.title')}</CardTitle>
          <CardDescription>{t('minerHashrate.error')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center">
            <p className="text-muted-foreground">
              {error || t('minerHashrate.noData')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{t('minerHashrate.title')}</CardTitle>
          <CardDescription>
            {t('minerHashrate.description')} - {t(TIME_PERIODS[selectedPeriod].labelKey)}
          </CardDescription>
        </div>
        
        {/* Time period selector */}
        <div className="flex gap-1">
          {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              disabled={isLoading}
            >
              {t(TIME_PERIODS[period].labelKey)}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={processedData}>
            <defs>
              <linearGradient id="fillMinerHashrate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillPoolHashrate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatXAxisLabel}
            />
            
            {/* Draw the pool hashrate FIRST so it appears BEHIND the miner hashrate */}
            <Area
              dataKey="poolHashrate"
              type="monotone"
              fill="url(#fillPoolHashrate)"
              stroke="#10b981"
              strokeWidth={2}
            />
            
            {/* Draw the miner hashrate SECOND so it appears ON TOP of pool hashrate */}
            <Area
              dataKey="minerHashrate"
              type="monotone"
              fill="url(#fillMinerHashrate)"
              stroke="#2563eb"
              strokeWidth={2}
            />
            
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  let minerHashrate = 0;
                  let poolHashrate = 0;
                  
                  payload.forEach(entry => {
                    if (entry.dataKey === "minerHashrate" && entry.value !== null && entry.value !== undefined) {
                      minerHashrate = Number(entry.value);
                    } else if (entry.dataKey === "poolHashrate" && entry.value !== null && entry.value !== undefined) {
                      poolHashrate = Number(entry.value);
                    }
                  });
                  
                  const contribution = poolHashrate > 0 ? (minerHashrate / poolHashrate) * 100 : 0;
                  
                  return (
                    <div className="rounded-md border bg-background p-3 shadow-sm">
                      <p className="mb-2 font-medium">
                        {new Date(label).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                      
                      {payload.map((entry, index) => {
                        if (!entry || entry.value === undefined || entry.value === null) {
                          return null;
                        }
                        
                        const value = Number(entry.value);
                        let name = entry.name;
                        let color = "#000";
                        
                        if (entry.dataKey === "minerHashrate") {
                          name = t('minerHashrate.yourHashrate');
                          color = "#2563eb";
                        } else if (entry.dataKey === "poolHashrate") {
                          name = t('minerHashrate.poolHashrate');
                          color = "#10b981";
                        }
                        
                        return (
                          <p key={index} className="text-sm flex items-center" style={{ color }}>
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                            {name}: {formatHashrate(value)}
                          </p>
                        );
                      })}
                      
                      {poolHashrate > 0 && (
                        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                          {t('minerHashrate.contribution', { percent: contribution.toFixed(2) })}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="text-sm text-muted-foreground border-l-4 border-[#2563eb] pl-2">
            <span className="font-medium">{t('minerHashrate.yourHashrateLabel')}</span> {formatHashrate(latestMinerHashrate)}
          </div>
          <div className="text-sm text-muted-foreground border-l-4 border-[#10b981] pl-2">
            <span className="font-medium">{t('minerHashrate.poolLabel')}</span> {formatHashrate(latestPoolHashrate)} ({minerPercentage}%)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}