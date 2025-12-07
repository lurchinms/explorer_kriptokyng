import { NextResponse } from 'next/server';
import { cryptoPriceApi } from '@/lib/services/crypto-price-api';
import { miningCoreApi } from '@/lib/services/miningcore-api';

export async function GET(request: Request) {
  try {
    // Extract parameters from query string
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const poolId = searchParams.get('poolId');
    
    console.log(`Price API request - symbol: ${symbol}, poolId: ${poolId}`);
    
    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is required" },
        { status: 400 }
      );
    }
    
    const upperCaseSymbol = symbol.toUpperCase();

    // If poolId is provided, check if the coin has market data first
    if (poolId) {
      try {
        const pool = await miningCoreApi.getPoolById(poolId);
        
        // Even if coin has no market data, we should still try to fetch price
        // Some coins might not have market data properly configured but still have prices
        if (pool && pool.coin) {
          console.log(`Pool ${poolId} coin data:`, {
            symbol: pool.coin.symbol,
            market: pool.coin.market,
            name: pool.coin.name
          });
        }
      } catch (error) {
        console.warn(`Failed to check pool data for ${poolId}:`, error);
        // Continue to try fetching price as fallback
      }
    }

    // Get the price data - always attempt regardless of market data
    const priceData = await cryptoPriceApi.getCoinPrice(upperCaseSymbol, poolId || undefined);
    console.log(`Returning price data for ${upperCaseSymbol}:`, priceData);
    
    // If we don't have a price, try to provide a more informative response
    if (!priceData || priceData.price === null) {
      console.log(`No price found for ${upperCaseSymbol}, returning null price response`);
    }
    
    return NextResponse.json(priceData);
  } catch (error) {
    console.error(`Failed to fetch price:`, error);
    
    // Return a graceful error response
    return NextResponse.json(
      { 
        symbol: new URL(request.url).searchParams.get('symbol')?.toUpperCase() || 'UNKNOWN',
        error: error instanceof Error ? error.message : "Unknown error",
        price: null,
        price_change_24h: null,
        price_change_24h_percentage: null,
        last_updated: new Date().toISOString()
      }, 
      { status: 200 } // Return 200 even for "not found" so UI doesn't show error
    );
  }
}