import { NextRequest, NextResponse } from 'next/server';
import { getPoolHashrateHistory } from '@/lib/database/miningcore-queries';

// Define available intervals and their corresponding minutes
const INTERVALS = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '1h': 60,
  '1d': 1440
} as const;

type IntervalKey = keyof typeof INTERVALS;

function groupPoolDataByInterval(data: any[], intervalMinutes: number) {
  if (intervalMinutes === 0) return data; // Return raw data if no grouping

  const grouped = new Map<number, { 
    poolhashrate: number; 
    connectedminers: number; 
    sharespersecond: number;
    networkhashrate: number;
    networkdifficulty: number;
    count: number; 
  }>();
  
  data.forEach(record => {
    const timestamp = new Date(record.created).getTime();
    // Round down to the nearest interval
    const intervalTimestamp = Math.floor(timestamp / (intervalMinutes * 60 * 1000)) * (intervalMinutes * 60 * 1000);
    
    const existing = grouped.get(intervalTimestamp);
    if (existing) {
      existing.poolhashrate += record.poolhashrate;
      existing.connectedminers += record.connectedminers;
      existing.sharespersecond += record.sharespersecond;
      existing.networkhashrate += record.networkhashrate;
      existing.networkdifficulty += record.networkdifficulty;
      existing.count += 1;
    } else {
      grouped.set(intervalTimestamp, {
        poolhashrate: record.poolhashrate,
        connectedminers: record.connectedminers,
        sharespersecond: record.sharespersecond,
        networkhashrate: record.networkhashrate,
        networkdifficulty: record.networkdifficulty,
        count: 1
      });
    }
  });

  // Convert to array and calculate averages
  return Array.from(grouped.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      poolHashrate: data.poolhashrate / data.count,
      connectedMiners: Math.round(data.connectedminers / data.count),
      sharesPerSecond: data.sharespersecond / data.count,
      networkHashrate: data.networkhashrate / data.count,
      networkDifficulty: data.networkdifficulty / data.count,
      dataPoints: data.count,
      created: new Date(timestamp).toISOString()
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const interval = (searchParams.get('interval') || '5m') as IntervalKey;
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    // Validate interval
    if (!INTERVALS[interval]) {
      return NextResponse.json(
        { 
          error: 'Invalid interval', 
          validIntervals: Object.keys(INTERVALS),
          description: {
            '1m': '1 minute',
            '5m': '5 minutes', 
            '15m': '15 minutes',
            '30m': '30 minutes',
            '1h': '1 hour',
            '1d': '1 day'
          }
        },
        { status: 400 }
      );
    }

    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID is required' },
        { status: 400 }
      );
    }


    // Get raw data from database
    const rawData = await getPoolHashrateHistory(poolId, hours);
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        interval,
        hours,
        message: 'No pool hashrate data found for the specified time period'
      });
    }

    // Group data by interval
    const intervalMinutes = INTERVALS[interval];
    const groupedData = groupPoolDataByInterval(rawData, intervalMinutes);
    
    // Apply limit
    const limitedData = limit > 0 ? groupedData.slice(-limit) : groupedData;

    // Calculate summary statistics
    const poolHashrates = limitedData.map(d => d.poolHashrate);
    const minerCounts = limitedData.map(d => d.connectedMiners);
    const summary = {
      avgPoolHashrate: poolHashrates.length > 0 ? poolHashrates.reduce((a, b) => a + b, 0) / poolHashrates.length : 0,
      maxPoolHashrate: poolHashrates.length > 0 ? Math.max(...poolHashrates) : 0,
      minPoolHashrate: poolHashrates.length > 0 ? Math.min(...poolHashrates) : 0,
      avgMiners: minerCounts.length > 0 ? minerCounts.reduce((a, b) => a + b, 0) / minerCounts.length : 0,
      maxMiners: minerCounts.length > 0 ? Math.max(...minerCounts) : 0,
      minMiners: minerCounts.length > 0 ? Math.min(...minerCounts) : 0,
      totalDataPoints: rawData.length,
      groupedDataPoints: limitedData.length,
      dataReduction: rawData.length > 0 ? ((rawData.length - limitedData.length) / rawData.length * 100).toFixed(1) + '%' : '0%'
    };

    return NextResponse.json({
      success: true,
      data: limitedData,
      count: limitedData.length,
      interval,
      intervalDescription: {
        '1m': '1 minute',
        '5m': '5 minutes', 
        '15m': '15 minutes',
        '30m': '30 minutes',
        '1h': '1 hour',
        '1d': '1 day'
      }[interval],
      hours,
      summary,
      rawDataCount: rawData.length
    });

  } catch (error) {
    console.error('Error fetching pool hashrate history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pool hashrate history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 