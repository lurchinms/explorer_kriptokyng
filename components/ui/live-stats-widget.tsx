'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Coins, Clock } from 'lucide-react';
import { usePoolStats, useNotificationCount, useConnectionHealth } from '@/hooks/use-websocket-stats';
import { useWebSocket } from '@/contexts/websocket-context';

interface LiveStatsWidgetProps {
  poolId?: string;
  className?: string;
}

export function LiveStatsWidget({ poolId, className }: LiveStatsWidgetProps) {
  const { isConnected } = useWebSocket();
  const stats = usePoolStats(poolId);
  const { count } = useNotificationCount();
  const { health, lastSeen } = useConnectionHealth();

  const getHealthColor = () => {
    switch (health) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatHashrate = (hashrate?: number) => {
    if (!hashrate) return 'N/A';
    
    if (hashrate >= 1e12) {
      return `${(hashrate / 1e12).toFixed(2)} TH/s`;
    } else if (hashrate >= 1e9) {
      return `${(hashrate / 1e9).toFixed(2)} GH/s`;
    } else if (hashrate >= 1e6) {
      return `${(hashrate / 1e6).toFixed(2)} MH/s`;
    } else if (hashrate >= 1e3) {
      return `${(hashrate / 1e3).toFixed(2)} KH/s`;
    }
    return `${hashrate} H/s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Live Stats</span>
            </CardTitle>
            <CardDescription>
              Real-time data from WebSocket notifications
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Badge 
              variant={health === 'good' ? 'default' : health === 'warning' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {health.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Hashrate */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Hashrate</p>
              <p className="text-sm font-medium">{formatHashrate(stats.hashrate)}</p>
            </div>
          </div>

          {/* Blocks */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
              <Coins className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Blocks Found</p>
              <p className="text-sm font-medium">{stats.blocks || 0}</p>
            </div>
          </div>

          {/* Payments */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
              <Coins className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payments</p>
              <p className="text-sm font-medium">{stats.payments || 0}</p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Activity</p>
              <p className="text-xs font-medium">{lastSeen.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Notification Counter */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Notifications Received:</span>
            <Badge variant="outline">{count}</Badge>
          </div>
        </div>

        {/* Recent Activity */}
        {(stats.lastBlockTime || stats.lastPaymentTime) && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
            {stats.lastBlockTime && (
              <div className="flex items-center justify-between text-xs">
                <span>Last Block:</span>
                <span>{new Date(stats.lastBlockTime).toLocaleTimeString()}</span>
              </div>
            )}
            {stats.lastPaymentTime && (
              <div className="flex items-center justify-between text-xs">
                <span>Last Payment:</span>
                <span>{new Date(stats.lastPaymentTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LiveStatsWidget;
