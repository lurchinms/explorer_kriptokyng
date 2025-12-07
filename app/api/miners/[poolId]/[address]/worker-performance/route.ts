import { NextRequest, NextResponse } from 'next/server';
import { getMinerWorkerStats } from '@/lib/database/miningcore-queries';

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

interface WorkerDataPoint {
  timestamp: number;
  worker: string;
  hashrate: number;
  sharesPerSecond: number;
  created: string;
  dataPoints?: number;
}

function groupWorkerDataByInterval(data: any[], intervalMinutes: number) {
  if (intervalMinutes === 0) return data; // Return raw data if no grouping

  const grouped = new Map<string, Map<number, { 
    hashrate: number; 
    sharesPerSecond: number;
    count: number; 
  }>>();
  
  data.forEach(record => {
    const timestamp = new Date(record.created).getTime();
    const worker = record.worker;
    
    // Round down to the nearest interval
    const intervalTimestamp = Math.floor(timestamp / (intervalMinutes * 60 * 1000)) * (intervalMinutes * 60 * 1000);
    
    if (!grouped.has(worker)) {
      grouped.set(worker, new Map());
    }
    
    const workerData = grouped.get(worker)!;
    const existing = workerData.get(intervalTimestamp);
    
    if (existing) {
      existing.hashrate += record.hashrate;
      existing.sharesPerSecond += record.sharespersecond;
      existing.count += 1;
    } else {
      workerData.set(intervalTimestamp, {
        hashrate: record.hashrate,
        sharesPerSecond: record.sharespersecond,
        count: 1
      });
    }
  });

  // Convert to array and calculate averages
  const result: WorkerDataPoint[] = [];
  
  grouped.forEach((workerData, worker) => {
    workerData.forEach((data, timestamp) => {
      result.push({
        timestamp,
        worker,
        hashrate: data.hashrate / data.count,
        sharesPerSecond: data.sharesPerSecond / data.count,
        dataPoints: data.count,
        created: new Date(timestamp).toISOString()
      });
    });
  });

  return result.sort((a, b) => a.timestamp - b.timestamp);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string; address: string }> }
) {
  try {
    const { poolId, address } = await params;
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

    if (!poolId || !address) {
      return NextResponse.json(
        { error: 'Pool ID and address are required' },
        { status: 400 }
      );
    }

    // Get raw data from database
    const rawData = await getMinerWorkerStats(poolId, address, hours);
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        workers: [],
        count: 0,
        interval,
        hours,
        message: 'No worker performance data found for this miner in the specified time period'
      });
    }

    // Group data by interval
    const intervalMinutes = INTERVALS[interval];
    const groupedData = groupWorkerDataByInterval(rawData, intervalMinutes);
    
    // Apply limit
    const limitedData = limit > 0 ? groupedData.slice(-limit) : groupedData;

    // Get unique worker names
    const workers = Array.from(new Set(limitedData.map(d => d.worker)));

    // Calculate summary statistics per worker
    const workerSummaries = workers.map(worker => {
      const workerData = limitedData.filter(d => d.worker === worker);
      const hashrates = workerData.map(d => d.hashrate);
      const sharesPerSecond = workerData.map(d => d.sharesPerSecond);
      
      return {
        worker,
        avgHashrate: hashrates.length > 0 ? hashrates.reduce((a, b) => a + b, 0) / hashrates.length : 0,
        maxHashrate: hashrates.length > 0 ? Math.max(...hashrates) : 0,
        minHashrate: hashrates.length > 0 ? Math.min(...hashrates) : 0,
        avgSharesPerSecond: sharesPerSecond.length > 0 ? sharesPerSecond.reduce((a, b) => a + b, 0) / sharesPerSecond.length : 0,
        dataPoints: workerData.length
      };
    });

    const summary = {
      totalWorkers: workers.length,
      totalDataPoints: rawData.length,
      groupedDataPoints: limitedData.length,
      dataReduction: rawData.length > 0 ? ((rawData.length - limitedData.length) / rawData.length * 100).toFixed(1) + '%' : '0%',
      workers: workerSummaries
    };

    return NextResponse.json({
      success: true,
      data: limitedData,
      workers,
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
    return NextResponse.json(
      { 
        error: 'Failed to fetch worker performance history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 