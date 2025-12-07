import { NextRequest, NextResponse } from 'next/server';
import { getMinerContributedBlocks } from '@/lib/database/miningcore-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string; address: string }> }
) {
  try {
    const { poolId, address } = await params;
    
    if (!poolId || !address) {
      return NextResponse.json(
        { error: 'Pool ID and address are required' },
        { status: 400 }
      );
    }
    const blocks = await getMinerContributedBlocks(poolId, address);

    
    return NextResponse.json(blocks, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 minutes cache
      },
    });
  } catch (error) {
    console.error('Error fetching miner contributed blocks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch contributed blocks', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
