"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, Clock } from "lucide-react";
import { useWebSocket } from "@/contexts/websocket-context";
import { useLiveData } from "@/contexts/live-data-context";
import { formatHashrate } from "@/lib/utils/format";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";

interface LivePoolStatsProps {
  poolId: string;
  currentHashrate?: number;
}

export function LivePoolStats({ poolId, currentHashrate = 0 }: LivePoolStatsProps) {
  const { t } = useLanguage();
  const { isConnected, connectionStatus } = useWebSocket();
  const { poolHashrates, getPoolEvents } = useLiveData();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  const liveHashrate = poolHashrates[poolId];
  const poolEvents = getPoolEvents(poolId);
  const hasLiveData = liveHashrate !== undefined;
  
  // Update timestamp when live data changes
  useEffect(() => {
    if (hasLiveData) {
      setLastUpdateTime(new Date());
    }
  }, [liveHashrate, hasLiveData]);
  
  // Calculate percentage change from API to live data
  const percentageChange = hasLiveData && currentHashrate > 0 
    ? ((liveHashrate - currentHashrate) / currentHashrate) * 100
    : 0;
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('pool.livePoolStats.title')}
          </CardTitle>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
          >
            {isConnected ? t('pool.livePoolStats.connected') : t('pool.livePoolStats.disconnected')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('pool.livePoolStats.status')}:</span>
          <span className={isConnected ? "text-green-600" : "text-muted-foreground"}>
            {connectionStatus}
          </span>
        </div>
        
        {/* Live Hashrate */}
        {hasLiveData && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  {t('pool.livePoolStats.liveHashrate')}:
                </span>
                <div className="text-right">
                  <div className="font-mono font-semibold">
                    {formatHashrate(liveHashrate)}
                  </div>
                  {Math.abs(percentageChange) > 0.1 && (
                    <div className={`text-xs flex items-center gap-1 ${percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className={`h-3 w-3 ${percentageChange < 0 ? 'rotate-180' : ''}`} />
                      {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t('pool.livePoolStats.lastUpdate')}:
              </span>
              <span className="font-mono">{formatTime(lastUpdateTime)}</span>
            </div>
          </>
        )}
        
        {/* Recent Pool Events */}
        {poolEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">{t('pool.livePoolStats.recentEvents')}:</h4>
            <div className="space-y-1">
              {poolEvents.slice(0, 3).map((event, index) => (
                <div 
                  key={index}
                  className="text-sm p-2 rounded-md bg-muted/50 border border-border/50"
                >
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No Live Data Message */}
        {!hasLiveData && isConnected && (
          <div className="text-sm text-muted-foreground text-center py-2">
            {t('pool.livePoolStats.waitingForData', { poolId })}
          </div>
        )}
        
        {!isConnected && (
          <div className="text-sm text-muted-foreground text-center py-2">
            {t('pool.livePoolStats.websocketDisconnected')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}