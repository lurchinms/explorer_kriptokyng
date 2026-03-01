export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
}

export async function getCryptoPrices(symbols: string[] = ['BTC', 'ETH', 'LTC']): Promise<CryptoPrice[]> {
  try {
    // Mock implementation - replace with actual price API (CoinGecko, CoinMarketCap, etc.)
    const mockPrices: CryptoPrice[] = symbols.map(symbol => ({
      symbol,
      price: Math.random() * 100000, // Random price for demo
      change24h: (Math.random() - 0.5) * 20, // Random change between -10% and +10%
      marketCap: Math.random() * 1000000000000,
      volume24h: Math.random() * 10000000000,
      lastUpdated: new Date().toISOString()
    }));

    return mockPrices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return [];
  }
}

export async function getCryptoPrice(symbol: string): Promise<CryptoPrice | null> {
  try {
    const prices = await getCryptoPrices([symbol]);
    return prices[0] || null;
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error);
    return null;
  }
}

// Export as default for compatibility
export const cryptoPriceApi = {
  getCryptoPrices,
  getCryptoPrice,
  getHistoricalPrices: async (symbol: string, days: number = 7) => {
    // Mock implementation
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 86400000).toISOString().split('T')[0],
      price: Math.random() * 100000
    }));
  }
};
