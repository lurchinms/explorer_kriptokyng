"use client";

import { Pool } from "@/lib/types/miningcore";
import { PoolDetails } from "./pool-details";
import { LivePoolStats } from "./live-pool-stats";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/contexts/websocket-context";
import { useLiveData } from "@/contexts/live-data-context";
import { Activity } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface LivePoolDetailsProps {
  pool: Pool;
}

export function LivePoolDetails({ pool }: LivePoolDetailsProps) {
  const { t } = useLanguage();
  const { isConnected } = useWebSocket();
  const { poolHashrates } = useLiveData();
  
  // Check if this pool has live hashrate data
  const hasLiveHashrate = isConnected && poolHashrates[pool.id] !== undefined;
  
  return (
    <div className="space-y-6">
      {/* Live Statistics Card */}
      <LivePoolStats 
        poolId={pool.id} 
        currentHashrate={pool.poolStats?.poolHashrate || 0}
      />
      
      <div className="relative">
        {/* Live Data Indicator */}
        {hasLiveHashrate && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="default" className="flex items-center gap-1 bg-green-500/10 text-green-600 border-green-500/20">
              <Activity className="h-3 w-3" />
              {t('common.live')}
            </Badge>
          </div>
        )}
        
        {/* Original Pool Details */}
        <PoolDetails pool={pool} />
      </div>
    </div>
  );
}