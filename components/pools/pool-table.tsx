"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/ui/coin-icon";
import { formatNumber, formatHashrate, formatCurrency } from "@/lib/utils/format";

interface PoolTableProps {
  pools: any[];
}

export function PoolTable({ pools }: PoolTableProps) {
  const [sortColumn, setSortColumn] = useState('miners');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  function getSortValue(pool: any, column: string) {
    switch (column) {
      case 'coin': return pool.coin.name;
      case 'type': return pool.paymentProcessing.payoutScheme;
      case 'algorithm': return pool.coin.algorithm;
      case 'fee': return pool.poolFeePercent;
      case 'miners': return pool.poolStats?.connectedMiners || 0;
      case 'hashrate': return pool.poolStats?.poolHashrate || 0;
      case 'blocks': return pool.totalBlocks || 0;
      case 'paid': return pool.totalPaid || 0;
      default: return '';
    }
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  }

  function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
    return active ? (
      direction === 'asc' ? <span>▲</span> : <span>▼</span>
    ) : <span className="opacity-30">▲</span>;
  }

  // Filter pools by search
  const filteredPools = pools.filter((pool) => {
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
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full mt-4">
      {/* Search bar right-aligned above table */}
      <div className="flex justify-end mb-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pools by coin or algorithm..."
            className="pl-12 pr-4 py-2 rounded-full bg-muted border-none w-full text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <table className="w-full bg-card/80 rounded-xl border border-border/30 shadow divide-y divide-border">
        <thead>
          <tr>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
              <button className="flex items-center gap-1" onClick={() => handleSort('coin')}>
                Coin <SortIcon active={sortColumn==='coin'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden md:table-cell">
              <button className="flex items-center gap-1" onClick={() => handleSort('type')}>
                Type <SortIcon active={sortColumn==='type'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden lg:table-cell">
              <button className="flex items-center gap-1" onClick={() => handleSort('algorithm')}>
                Algorithm <SortIcon active={sortColumn==='algorithm'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden lg:table-cell">
              <button className="flex items-center gap-1" onClick={() => handleSort('fee')}>
                Fee <SortIcon active={sortColumn==='fee'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
              <button className="flex items-center gap-1" onClick={() => handleSort('miners')}>
                Miners <SortIcon active={sortColumn==='miners'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
              <button className="flex items-center gap-1" onClick={() => handleSort('hashrate')}>
                Hashrate <SortIcon active={sortColumn==='hashrate'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden xl:table-cell">
              <button className="flex items-center gap-1" onClick={() => handleSort('blocks')}>
                Blocks <SortIcon active={sortColumn==='blocks'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden xl:table-cell whitespace-nowrap">
              <button className="flex items-center gap-1" onClick={() => handleSort('paid')}>
                Total Paid <SortIcon active={sortColumn==='paid'} direction={sortDirection} />
              </button>
            </th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {sortedPools.map((pool) => (
            <tr key={pool.id} className="hover:bg-muted/40 transition">
              <td className="px-6 py-5 whitespace-nowrap flex items-center gap-3">
                <CoinIcon 
                  symbol={pool.coin.symbol} 
                  name={pool.coin.name} 
                  size={32} 
                  className="min-w-[32px]"
                />
                <span className="font-semibold text-base text-foreground">{pool.coin.name} <span className="text-muted-foreground font-normal">({pool.coin.symbol})</span></span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden md:table-cell">{pool.paymentProcessing.payoutScheme}</td>
              <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden lg:table-cell">{pool.coin.algorithm}</td>
              <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden lg:table-cell">{pool.poolFeePercent}%</td>
              <td className="px-6 py-5 whitespace-nowrap text-base font-semibold">{formatNumber(pool.poolStats?.connectedMiners || 0, 0)}</td>
              <td className="px-6 py-5 whitespace-nowrap text-base font-semibold">{formatHashrate(pool.poolStats?.poolHashrate || 0)}</td>
              <td className="px-6 py-5 whitespace-nowrap text-base font-semibold hidden xl:table-cell">{formatNumber(pool.totalBlocks || 0, 0)}</td>
              <td className="px-6 py-5 whitespace-nowrap text-base font-semibold hidden xl:table-cell">{formatCurrency(pool.totalPaid || 0)}</td>
              <td className="px-6 py-5 whitespace-nowrap">
                {/* Desktop: Full button */}
                <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
                  <Link href={`/pools/${pool.id}`}>View Details</Link>
                </Button>
                {/* Mobile: Arrow icon only */}
                <Link href={`/pools/${pool.id}`} className="inline-flex md:hidden items-center justify-center p-2 rounded hover:bg-muted transition">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 