import { NextRequest, NextResponse } from 'next/server';
import { getMinerHashrateHistory } from '@/lib/database/miningcore-queries';

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

function groupDataByInterval(data: any[], intervalMinutes: number) {
  if (intervalMinutes === 0) return data; // Return raw data if no grouping

  const grouped = new Map<number, { hashrate: number; count: number; sharesPerSecond: number; firstTime: Date }>();
  
  data.forEach(record => {
    const timestamp = new Date(record.created).getTime();
    // Round down to the nearest interval
    const intervalTimestamp = Math.floor(timestamp / (intervalMinutes * 60 * 1000)) * (intervalMinutes * 60 * 1000);
    
    const existing = grouped.get(intervalTimestamp);
    if (existing) {
      existing.hashrate += record.hashrate;
      existing.sharesPerSecond += record.sharespersecond;
      existing.count += 1;
    } else {
      grouped.set(intervalTimestamp, {
        hashrate: record.hashrate,
        sharesPerSecond: record.sharespersecond,
        count: 1,
        firstTime: record.created
      });
    }
  });

  // Convert to array and calculate averages
  return Array.from(grouped.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      hashrate: data.hashrate / data.count, // Average hashrate for the interval
      sharesPerSecond: data.sharesPerSecond / data.count,
      dataPoints: data.count,
      created: new Date(timestamp).toISOString()
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string; address: string }> }
) {
  try {
    const { poolId, address } = await params;
    
    // Decode URI components in case they were encoded
    const decodedPoolId = decodeURIComponent(poolId);
    const decodedAddress = decodeURIComponent(address);
    
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const interval = (searchParams.get('interval') || '1m') as IntervalKey;
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

    if (!decodedPoolId || !decodedAddress) {
      return NextResponse.json(
        { error: 'Pool ID and address are required' },
        { status: 400 }
      );
    }


    // Get raw data from database
    const rawData = await getMinerHashrateHistory(decodedPoolId, decodedAddress, hours);
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        interval,
        hours,
        message: 'No hashrate data found for this miner in the specified time period'
      });
    }

    // Group data by interval
    const intervalMinutes = INTERVALS[interval];
    const groupedData = groupDataByInterval(rawData, intervalMinutes);
    
    // Apply limit
    const limitedData = limit > 0 ? groupedData.slice(-limit) : groupedData;

    // Calculate summary statistics
    const hashrates = limitedData.map(d => d.hashrate);
    const summary = {
      avgHashrate: hashrates.length > 0 ? hashrates.reduce((a, b) => a + b, 0) / hashrates.length : 0,
      maxHashrate: hashrates.length > 0 ? Math.max(...hashrates) : 0,
      minHashrate: hashrates.length > 0 ? Math.min(...hashrates) : 0,
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
    console.error('❌ Error in hashrate-history API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch hashrate history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 