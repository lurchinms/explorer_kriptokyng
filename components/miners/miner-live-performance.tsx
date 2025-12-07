"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWebSocketSubscription } from "@/contexts/websocket-context";
import { useLanguage } from "@/contexts/language-context";
import { formatHashrate, formatNumber } from "@/lib/utils/format";
import { Activity, Users, Zap, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface MinerLivePerformanceProps {
  poolId: string;
  address: string;
  stats: any;
}

interface LiveMetrics {
  hashrate: number;
  workers: number;
  lastUpdate: Date;
  isActive: boolean;
}

interface HashrateDataPoint {
  timestamp: number;
  hashrate: number;
  formattedTime: string;
  isLive?: boolean; // Flag to distinguish live vs database data
  dataPoints?: number; // For database data aggregation info
  uniqueId?: string; // Unique identifier for React keys
}

interface DatabaseHashrateResponse {
  success: boolean;
  data: Array<{
    timestamp: number;
    hashrate: number;
    sharesPerSecond: number;
    dataPoints: number;
    created: string;
  }>;
  count: number;
  summary?: {
    avgHashrate: number;
    maxHashrate: number;
    minHashrate: number;
  };
  error?: string;
}

const MAX_LIVE_POINTS = 60; // Keep last 60 live points (1 hour at 1-min intervals)
const MAX_CHART_POINTS = 200; // Total chart points for performance

export function MinerLivePerformance({ 
  poolId, 
  address, 
  stats
}: MinerLivePerformanceProps) {
  const { t } = useLanguage();
  
  // Calculate worker count from stats
  const activeWorkers = stats.performance?.workers || {};
  const activeWorkerCount = Object.entries(activeWorkers)
    .filter(([, worker]: [string, any]) => worker.hashrate > 0)
    .length;
  
  const totalCurrentHashrate = Object.values(activeWorkers).reduce((sum: number, worker: any) => {
    return sum + (worker?.hashrate || 0);
  }, 0);

  const [metrics, setMetrics] = useState<LiveMetrics>({
    hashrate: totalCurrentHashrate,
    workers: activeWorkerCount,
    lastUpdate: new Date(),
    isActive: totalCurrentHashrate > 0
  });

  // Separate state for database and live data
  const [databaseHistory, setDatabaseHistory] = useState<HashrateDataPoint[]>([]);
  const [livePoints, setLivePoints] = useState<HashrateDataPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastDbFetch, setLastDbFetch] = useState<Date | null>(null);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null);

  // Combine database and live data for the chart
  const combinedHistory = React.useMemo(() => {
    // Merge database and live data, removing duplicates and keeping chronological order
    const combined = [...databaseHistory, ...livePoints];
    
    // Remove duplicates by timestamp, preferring live data over database data
    const uniqueData = new Map<number, HashrateDataPoint>();
    combined.forEach(point => {
      const existing = uniqueData.get(point.timestamp);
      if (!existing || point.isLive) {
        // Add unique ID for React keys
        uniqueData.set(point.timestamp, {
          ...point,
          uniqueId: `${point.isLive ? 'live' : 'db'}-${point.timestamp}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
    });
    
    return Array.from(uniqueData.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-MAX_CHART_POINTS); // Limit total points for performance
  }, [databaseHistory, livePoints]);

  // Function to fetch hashrate history from database API
  const fetchHashrateHistory = useCallback(async (hours: number = 24) => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      
      const response = await fetch(
        `/api/miners/${encodeURIComponent(poolId)}/${encodeURIComponent(address)}/hashrate-history?hours=${hours}&interval=1m&limit=1000`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: DatabaseHashrateResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch hashrate history');
      }
      
      
      // Convert database response to chart format
      const chartData: HashrateDataPoint[] = data.data.map(point => ({
        timestamp: point.timestamp,
        hashrate: point.hashrate,
        formattedTime: new Date(point.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        }),
        isLive: false,
        dataPoints: point.dataPoints
      }));
      
      setDatabaseHistory(chartData);
      setLastDbFetch(new Date());
      
      // Clean up live points that overlap with database data
      const latestDbTimestamp = chartData.length > 0 ? Math.max(...chartData.map(p => p.timestamp)) : 0;
      setLivePoints(prev => prev.filter(point => point.timestamp > latestDbTimestamp));
      
    } catch (error) {
      console.error('❌ Failed to fetch database hashrate history:', error);
      setHistoryError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [poolId, address]);

  // Initial database load
  useEffect(() => {
    fetchHashrateHistory();
  }, [fetchHashrateHistory]);

  // Periodic database refresh (every 5 minutes)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchHashrateHistory();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchHashrateHistory]);

  // Add live hashrate point from WebSocket or current stats
  const addLivePoint = useCallback((hashrate: number) => {
    const now = Date.now();
    const newPoint: HashrateDataPoint = {
      timestamp: now,
      hashrate,
              formattedTime: new Date(now).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        }),
      isLive: true
    };
    
    setLivePoints(prev => {
      // Remove points older than 1 hour to prevent memory bloat
      const oneHourAgo = now - (60 * 60 * 1000);
      const filtered = prev.filter(point => point.timestamp > oneHourAgo);
      
      // Add new point and limit total live points
      return [...filtered, newPoint].slice(-MAX_LIVE_POINTS);
    });
    
    setLastLiveUpdate(new Date());
  }, []);

  // Listen for hashrate updates for this specific miner (WebSocket live updates)
  useWebSocketSubscription(['hashrateupdated'], (message) => {
    if (message.data.poolId === poolId && message.data.miner === address) {
      const newHashrate = message.data.hashrate || 0;
      
      // Update live metrics
      setMetrics(prev => ({
        ...prev,
        hashrate: newHashrate,
        lastUpdate: new Date(),
        isActive: newHashrate > 0
      }));
      
      // Add live data point
      addLivePoint(newHashrate);
      
    }
  });

  // Listen for worker connection events
  useWebSocketSubscription(['workerconnected', 'workerdisconnected'], (message) => {
    if (message.data.poolId === poolId && message.data.miner === address) {
      const isConnected = message.type === 'workerconnected';
      setMetrics(prev => ({
        ...prev,
        workers: isConnected ? prev.workers + 1 : Math.max(0, prev.workers - 1),
        lastUpdate: new Date(),
        isActive: isConnected || prev.workers > 1
      }));
    }
  });

  // Listen for miner connection status
  useWebSocketSubscription(['minerconnected', 'minerdisconnected'], (message) => {
    if (message.data.poolId === poolId && message.data.miner === address) {
      const isConnected = message.type === 'minerconnected';
      setMetrics(prev => ({
        ...prev,
        isActive: isConnected,
        lastUpdate: new Date()
      }));
    }
  });

  // Add current stats as live point if we have fresh data
  useEffect(() => {
    if (totalCurrentHashrate > 0 && !lastLiveUpdate) {
      addLivePoint(totalCurrentHashrate);
    }
  }, [totalCurrentHashrate, addLivePoint, lastLiveUpdate]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchHashrateHistory();
    // Also add current live point
    if (metrics.hashrate > 0) {
      addLivePoint(metrics.hashrate);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Calculate data summary
  const allHashrates = combinedHistory.map(point => point.hashrate).filter(h => h > 0);
  const avgHashrate = allHashrates.length > 0 ? allHashrates.reduce((a, b) => a + b, 0) / allHashrates.length : 0;
  const maxHashrate = allHashrates.length > 0 ? Math.max(...allHashrates) : 0;
  const currentHashrate = combinedHistory.length > 0 ? combinedHistory[combinedHistory.length - 1].hashrate : 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Combined Database + Live Hashrate History Chart */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              {t('minerLivePerformance.hashrateHistory')}
              <Badge variant={metrics.isActive ? "default" : "secondary"}>
                {metrics.isActive ? t('common.live') : t('minerLivePerformance.inactive')}
              </Badge>
              {livePoints.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{livePoints.length} {t('common.live')}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingHistory}
              className="h-8 w-8 p-0"
              title={t('common.refresh')}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {historyError ? (
            <div className="h-32 flex items-center justify-center text-red-500 text-sm">
              {t('minerLivePerformance.databaseError')}: {historyError}
              <br />
              <small className="text-muted-foreground mt-1">
                {livePoints.length > 0 ? t('minerLivePerformance.showingLiveOnly', { count: livePoints.length }) : t('minerLivePerformance.noData')}
              </small>
            </div>
          ) : (
            <div className="h-32 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedHistory}>
                  <XAxis 
                    dataKey="timestamp"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                                         tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString([], { 
                       hour: '2-digit', 
                       minute: '2-digit',
                       hour12: false
                     })}
                    hide
                  />
                  <YAxis hide />
                  <Tooltip 
                    labelFormatter={(timestamp) => {
                      const date = new Date(timestamp);
                      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                    }}
                    formatter={(value: number, name, props) => {
                      const point = props.payload;
                      const source = point?.isLive ? t('common.live') : t('minerLivePerformance.database');
                      const aggregation = point?.dataPoints ? ` (${point.dataPoints} ${t('minerLivePerformance.samples')})` : "";
                      return [
                        formatHashrate(value), 
                        `${t('minerHashrate.hashrate')} - ${source}${aggregation}`
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--popover-foreground))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hashrate" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={(props) => {
                      // Highlight live points with a different color
                      const isLive = props.payload?.isLive;
                      if (isLive) {
                        return (
                          <circle 
                            key={props.payload?.uniqueId || `live-${props.payload?.timestamp}-${Math.random()}`}
                            cx={props.cx} 
                            cy={props.cy} 
                            r={2} 
                            fill="#10b981" 
                            stroke="#10b981"
                          />
                        );
                      }
                      // Return false to hide dots for database points
                      return false as any;
                    }}
                    activeDot={{ r: 3, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Data Summary */}
          <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">{t('minerLivePerformance.current')}</div>
              <div className="text-blue-600">{formatHashrate(currentHashrate)}</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">{t('minerLivePerformance.average')}</div>
              <div className="text-green-600">{formatHashrate(avgHashrate)}</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">{t('minerLivePerformance.peak')}</div>
              <div className="text-orange-600">{formatHashrate(maxHashrate)}</div>
            </div>
          </div>
          
          {/* Status Information */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <div>
              {t('minerLivePerformance.historical')}: {databaseHistory.length} {t('minerLivePerformance.points')}
              {isLoadingHistory && ` (${t('minerLivePerformance.loading')}...)`}
            </div>
            <div>
              {t('common.live')}: {livePoints.length} {t('minerLivePerformance.points')}
            </div>
            <div>
              {t('minerLivePerformance.total')}: {combinedHistory.length}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <div>
              {t('minerLivePerformance.lastSync')}: {lastDbFetch?.toLocaleTimeString([], { hour12: false }) || t('common.never')}
            </div>
            <div>
              {t('minerLivePerformance.liveUpdate')}: {lastLiveUpdate?.toLocaleTimeString([], { hour12: false }) || metrics.lastUpdate.toLocaleTimeString([], { hour12: false })}
            </div>
          </div>
        </CardContent>
        
        {/* Status Indicators */}
        {metrics.isActive && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" 
               title={t('minerLivePerformance.minerIsActive')} />
        )}
        {isLoadingHistory && (
          <div className="absolute top-2 right-8 w-2 h-2 bg-blue-500 rounded-full animate-pulse" 
               title={t('minerLivePerformance.loadingDatabase')} />
        )}
        {livePoints.length > 0 && (
          <div className="absolute top-2 right-14 w-2 h-2 bg-orange-500 rounded-full animate-pulse" 
               title={t('minerLivePerformance.liveDataPoints', { count: livePoints.length })} />
        )}
      </Card>
    </motion.div>
  );
} 