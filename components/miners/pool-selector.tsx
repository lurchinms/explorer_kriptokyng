"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoinIcon } from "@/components/ui/coin-icon";

// Define a Pool type for reuse
type Pool = {
  id: string;
  coin: {
    symbol: string;
    name: string;
  };
  paymentProcessing?: {
    payoutScheme: string;
  };
};

interface PoolSelectorProps {
  pools: Pool[];
  onPoolSelect?: (poolId: string) => void;
}

export function PoolSelector({ pools, onPoolSelect }: PoolSelectorProps) {
  // Add type annotation to the pool parameter
  function getPoolTypeLabel(pool: Pool): string {
    if (!pool.paymentProcessing) return "";
    
    const scheme = pool.paymentProcessing.payoutScheme;
    if (scheme === "SOLO") return "Solo";
    if (scheme === "PROP") return "PROP";
    if (scheme === "PPLNS") return "PPLNS";
    return scheme;
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {pools.map((pool) => {
        const poolType = getPoolTypeLabel(pool);
        return (
          <Button 
            key={pool.id} 
            variant="outline"
            size="sm"
            className="flex items-center gap-2 py-1.5 h-auto"
            onClick={() => {
              if (onPoolSelect) {
                onPoolSelect(pool.id);
              }
            }}
          >
            <CoinIcon 
              symbol={pool.coin.symbol} 
              name={pool.coin.name} 
              size={20} 
            />
            <span>{pool.coin.symbol}</span>
            <Badge variant="default" className="text-xs ml-1">
              {poolType || 'Unknown'}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}