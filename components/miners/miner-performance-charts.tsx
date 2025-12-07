"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, TooltipProps
} from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatHashrate, formatNumber } from "@/lib/utils/format";
import { Loader2, Gauge, RefreshCw } from "lucide-react";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useLanguage } from "@/contexts/language-context"; // Added import

interface MinerPerformanceChartsProps {
  poolId: string;
  address: string;
  activeWorkers?: Record<string, { hashrate: number; sharesPerSecond: number }>;
  workerNames?: string[];
}

interface WorkerDataPoint {
  timestamp: number;
  worker: string;
  hashrate: number;
  sharesPerSecond: number;
  created: string;
  dataPoints?: number;
}

interface WorkerPerformanceResponse {
  success: boolean;
  data: WorkerDataPoint[];
  workers: string[];
  count: number;
  summary?: {
    totalWorkers: number;
    workers: Array<{
      worker: string;
      avgHashrate: number;
      maxHashrate: number;
      minHashrate: number;
      avgSharesPerSecond: number;
      dataPoints: number;
    }>;
  };
  error?: string;
}

interface ChartDataPoint {
  time: string;
  date: string;
  timestamp: number;
  [key: string]: any; // For dynamic worker hashrate keys
}

// Time period configurations
const TIME_PERIODS = {
  '24h': { hours: 24, interval: '5m', labelKey: 'minerPerformance.timePeriods.hours24' },
  'week': { hours: 168, interval: '30m', labelKey: 'minerPerformance.timePeriods.week' },
  'month': { hours: 720, interval: '2h', labelKey: 'minerPerformance.timePeriods.month' },
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;

export function MinerPerformanceCharts({ 
  poolId, 
  address, 
  activeWorkers = {}, 
  workerNames = [] 
}: MinerPerformanceChartsProps) {
  const { t } = useLanguage(); // Added language hook
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24h');
  const [workerData, setWorkerData] = useState<WorkerDataPoint[]>([]);
  const [workers, setWorkers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch worker performance data
  const fetchWorkerPerformance = useCallback(async (period: TimePeriod) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { hours, interval } = TIME_PERIODS[period];
      
      const response = await fetch(
        `/api/miners/${poolId}/${address}/worker-performance?hours=${hours}&interval=${interval}&limit=1000`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: WorkerPerformanceResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch worker performance data');
      }
      
      setWorkerData(data.data || []);
      setWorkers(data.workers || []);
      setLastFetch(new Date());
      
    } catch (err) {
      console.error('❌ Failed to fetch worker performance:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setWorkerData([]);
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  }, [poolId, address]);

  // Load data when component mounts or period changes
  useEffect(() => {
    fetchWorkerPerformance(selectedPeriod);
  }, [selectedPeriod, fetchWorkerPerformance]);

  // Process data for the chart - organize by timestamp
  const processedData = React.useMemo((): ChartDataPoint[] => {
    if (!workerData.length) return [];
    
    // Group data points by timestamp
    const timeGroups = new Map<number, ChartDataPoint>();
    
    workerData.forEach(point => {
      const timestamp = point.timestamp;
      
      if (!timeGroups.has(timestamp)) {
        const date = new Date(timestamp);
        timeGroups.set(timestamp, {
          time: date.toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: false 
          }),
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          timestamp,
        });
      }
      
      const timeGroup = timeGroups.get(timestamp)!;
      timeGroup[`${point.worker}_hashrate`] = point.hashrate;
    });
    
    return Array.from(timeGroups.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [workerData]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchWorkerPerformance(selectedPeriod);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("minerPerformance.title")}</CardTitle>
          <CardDescription>{t("minerPerformance.loading")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("minerPerformance.title")}</CardTitle>
          <CardDescription>{t("minerPerformance.error")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center">
            <p className="text-muted-foreground">
              {error || t("minerPerformance.noData")}
            </p>
            {!error && (
              <small className="text-muted-foreground mt-2">
                {t("minerPerformance.tryDifferentPeriod")}
              </small>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="rounded-md border bg-background p-3 shadow-sm">
          <p className="mb-1 font-medium">{label}</p>
          {payload.map((entry, index) => {
            if (!entry || entry.name === undefined || entry.value === undefined) {
              return null;
            }

            const workerName = String(entry.name).replace(/_hashrate$/, '');
            const value = Number(entry.value);

            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {workerName}: {formatHashrate(value)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Generate colors for each worker - spaced evenly around the color wheel
  const getWorkerColor = (index: number, total: number) => {
    const hue = (index * 360 / total) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{t("minerPerformance.title")}</CardTitle>
          <CardDescription>
            {t("minerPerformance.description")} - {t(TIME_PERIODS[selectedPeriod].labelKey as any)}
          </CardDescription>
        </div>
        
        {/* Time period selector */}
        <div className="flex gap-1 mr-2">
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
        
        {/* Refresh button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-8 w-8 p-0"
          title={t("common.refresh")}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                tickFormatter={(value) => formatHashrate(value, 0)}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {workers.map((worker, index) => (
                <Line
                  key={worker}
                  type="monotone"
                  dataKey={`${worker}_hashrate`}
                  name={worker}
                  stroke={getWorkerColor(index, workers.length)}
                  activeDot={{ r: 6 }}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Data Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div>
              {t("minerPerformance.workers")}: {workers.length}
            </div>
            <div>
              {t("minerPerformance.dataPoints")}: {workerData.length}
            </div>
            <div>
              {t("minerPerformance.lastUpdated")}: {lastFetch?.toLocaleTimeString([], { hour12: false }) || t("common.never")}
            </div>
          </div>
        </div>
        
        {/* Active Workers Section */}
        {workerNames.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4">{t("minerPerformance.activeWorkers")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workerNames.map((name, index) => {
                const worker = activeWorkers[name];
                const workerColor = getWorkerColor(index, workerNames.length);
                return (
                  <div 
                    key={name} 
                    className="flex items-center p-3 border rounded-lg"
                  >
                    <div className="mr-3 p-2 rounded-full" style={{ backgroundColor: `${workerColor}20` }}>
                      <Gauge className="h-6 w-6" style={{ color: workerColor }} />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium">{name || t("minerPerformance.defaultWorker")}</h4>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {formatHashrate(worker?.hashrate || 0)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(worker?.sharesPerSecond || 0, 6)} {t("minerPerformance.sharesPerSecond")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}