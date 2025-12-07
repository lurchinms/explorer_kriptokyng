"use client";

import { Pool } from "@/lib/types/miningcore";
import { CoinIcon } from "@/components/ui/coin-icon";

interface PoolIconSelectorProps {
  pools: Pool[];
}

export function PoolIconSelector({ pools }: PoolIconSelectorProps) {
  const handlePoolSelect = (poolId: string) => {
    const select = document.getElementById('poolId') as HTMLSelectElement;
    if (select) {
      select.value = poolId;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-10">
      {pools.map((pool) => (
        <div 
          key={pool.id} 
          className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handlePoolSelect(pool.id)}
        >
          <CoinIcon 
            symbol={pool.coin.symbol} 
            name={pool.coin.name} 
            size={36} 
            className="min-w-[36px]"
          />
          <span className="text-sm mt-1">{pool.coin.symbol}</span>
        </div>
      ))}
    </div>
  );
}