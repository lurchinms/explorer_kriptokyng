"use client";

import { useQuery } from "@tanstack/react-query";

export interface CryptoPrice {
  symbol: string;
  price: number | null;  // null is a valid value
  price_change_24h: number | null;
  price_change_24h_percentage: number | null;
  last_updated: string;
}

/**
 * Hook to fetch cryptocurrency price data
 */
export function useCryptoPrice(symbol: string | null, poolId?: string) {
  return useQuery<CryptoPrice, Error, CryptoPrice>({
    queryKey: ["crypto-price", symbol, poolId],
    queryFn: async (): Promise<CryptoPrice> => {
      if (!symbol) {
        throw new Error("Symbol is required");
      }
      
      // Build URL with query parameters
      const url = new URL("/api/prices", window.location.origin);
      url.searchParams.append("symbol", symbol);
      if (poolId) {
        url.searchParams.append("poolId", poolId);
      }
        
      const response = await fetch(url.toString());
      const data = await response.json();
      
      // Ensure we return a proper CryptoPrice object even if there are issues
      const result: CryptoPrice = {
        symbol: data.symbol || symbol,
        price: typeof data.price === 'number' ? data.price : null,
        price_change_24h: typeof data.price_change_24h === 'number' ? data.price_change_24h : null,
        price_change_24h_percentage: typeof data.price_change_24h_percentage === 'number' ? data.price_change_24h_percentage : null,
        last_updated: typeof data.last_updated === 'string' ? data.last_updated : new Date().toISOString()
      };
      
      return result;
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Only retry once for most errors
      console.warn(`Price fetch retry ${failureCount + 1}/2:`, error);
      return failureCount < 1;
    },
  });
}
