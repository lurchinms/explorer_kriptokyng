"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CoinIcon } from "@/components/ui/coin-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, X, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface HistoryItem {
  address: string;
  poolId: string;
  poolSymbol: string;
  timestamp: number;
}

interface Pool {
  id: string;
  coin: {
    symbol: string;
    name: string;
  };
  paymentProcessing?: {
    payoutScheme: string;
  };
}

interface MinerSearchFormProps {
  pools: Pool[];
  onSearch: (poolId: string, address: string) => void;
  onPoolSelect?: (poolId: string) => void;
  selectedPool?: string;
}

function getPoolTypeLabel(pool: Pool): string {
  if (!pool.paymentProcessing) return "";
  
  const scheme = pool.paymentProcessing.payoutScheme;
  if (scheme === "SOLO") return "Solo";
  if (scheme === "PROP") return "PROP";
  if (scheme === "PPLNS") return "PPLNS";
  return scheme;
}

export function MinerSearchForm({ pools, onSearch, onPoolSelect, selectedPool: externalSelectedPool }: MinerSearchFormProps) {
  const { t } = useLanguage();
  const [selectedPool, setSelectedPool] = useState<string>(externalSelectedPool || "");
  const [address, setAddress] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Load history and last used values from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('miner-search-history');
    if (savedHistory) {
      try {
        const parsedHistory: HistoryItem[] = JSON.parse(savedHistory);
        setHistory(parsedHistory);
        
        // Auto-fill with the most recent entry if no external selection
        if (parsedHistory.length > 0 && !externalSelectedPool && !selectedPool) {
          const mostRecent = parsedHistory[0];
          setSelectedPool(mostRecent.poolId);
          setAddress(mostRecent.address);
          if (onPoolSelect) {
            onPoolSelect(mostRecent.poolId);
          }
        }
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save to history
  const saveToHistory = (poolId: string, address: string) => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool) return;

    const newItem: HistoryItem = {
      address,
      poolId,
      poolSymbol: pool.coin.symbol,
      timestamp: Date.now()
    };

    // Remove duplicate entries and add new one at the beginning
    const updatedHistory = [
      newItem,
      ...history.filter(item => 
        !(item.address === address && item.poolId === poolId)
      )
    ].slice(0, 10); // Keep only last 10 entries

    setHistory(updatedHistory);
    localStorage.setItem('miner-search-history', JSON.stringify(updatedHistory));
  };

  // Load from history item
  const loadFromHistory = (item: HistoryItem) => {
    setAddress(item.address);
    setSelectedPool(item.poolId);
    if (onPoolSelect) {
      onPoolSelect(item.poolId);
    }
    setShowHistory(false);
  };

  // Remove item from history
  const removeFromHistory = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem('miner-search-history', JSON.stringify(updatedHistory));
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('miner-search-history');
    setShowHistory(false);
  };

  // Update internal state when external selectedPool changes
  useEffect(() => {
    if (externalSelectedPool && externalSelectedPool !== selectedPool) {
      setSelectedPool(externalSelectedPool);
    }
  }, [externalSelectedPool]);

  const handlePoolChange = (poolId: string) => {
    setSelectedPool(poolId);
    if (onPoolSelect) {
      onPoolSelect(poolId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPool && address) {
      saveToHistory(selectedPool, address);
      onSearch(selectedPool, address);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return t("miners.justNow");
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}${t("miners.hoursAgoSuffix")}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-24 gap-4">
          <div className="md:col-span-16 relative">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("miners.enterWalletAddress")}
              className="h-11 text-base px-4 pr-10"
              required
            />
            {history.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="md:col-span-5">
            <Select value={selectedPool} onValueChange={handlePoolChange} required>
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder={t("miners.selectPool") || "Select pool"} />
              </SelectTrigger>
              <SelectContent>
                {pools.map((pool) => {
                  const poolType = getPoolTypeLabel(pool);
                  return (
                    <SelectItem key={pool.id} value={pool.id}>
                      <div className="flex items-center gap-2">
                        <CoinIcon 
                          symbol={pool.coin.symbol} 
                          name={pool.coin.name} 
                          size={20} 
                        />
                        <span>{pool.coin.symbol}</span>
                        {poolType && (
                          <span className="text-xs text-muted-foreground">- {poolType}</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Button type="submit" className="w-full h-11">
              {t("common.search")}
            </Button>
          </div>
        </div>
      </form>

      {/* History Dropdown */}
      {showHistory && history.length > 0 && (
        <Card className="mt-2 shadow-lg border border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("miners.recentSearches")}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs h-7 px-2"
                >
                  {t("miners.clearAll")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={`${item.address}-${item.poolId}-${item.timestamp}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CoinIcon 
                      symbol={item.poolSymbol} 
                      name={item.poolSymbol}
                      size={16} 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {item.poolSymbol}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.address}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => removeFromHistory(index, e)}
                    className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 hover:opacity-100 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 