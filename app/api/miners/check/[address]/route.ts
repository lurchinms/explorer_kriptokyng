import { NextRequest, NextResponse } from 'next/server';
import { miningCoreApi } from '@/lib/services/miningcore-api';
import { getMinerHashrateHistory, getMinerPayments, getMinerStatsSummary } from '@/lib/database/miningcore-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }


    // Get all pools first
    const pools = await miningCoreApi.getPools();
    
    const minerData: any = {
      address,
      pools: [],
      totalStats: {
        hashrate: 0,
        totalPaid: 0,
        pendingBalance: 0,
        confirmedBalance: 0,
        activeWorkers: 0
      }
    };

    // Check each pool for this miner
    for (const pool of pools) {
      try {
        
        // Get miner stats from API
        const stats = await miningCoreApi.getMinerStats(pool.id, address);
        
        if (stats && Object.keys(stats).length > 0) {
          
          // Get additional data from database
          try {
            const [hashrateHistory, payments, summary] = await Promise.all([
              getMinerHashrateHistory(pool.id, address, 24),
              getMinerPayments(pool.id, address, 10),
              getMinerStatsSummary(pool.id, address)
            ]);

            const poolData = {
              poolId: pool.id,
              poolName: pool.coin?.name || pool.id,
              poolSymbol: pool.coin?.type || pool.id.toUpperCase(),
              apiStats: stats,
              performance: stats.performance || {},
              pendingShares: stats.pendingShares || 0,
              pendingBalance: stats.pendingBalance || 0,
              totalPaid: stats.totalPaid || 0,
              todayPaid: stats.todayPaid || 0,
              // Database data
              hashrateHistory: hashrateHistory,
              recentPayments: payments,
              summary: summary.length > 0 ? summary[0] : null
            };

            minerData.pools.push(poolData);

            // Add to totals
            if (stats.performance?.workers) {
              const totalHashrate = Object.values(stats.performance.workers)
                .reduce((sum: number, worker: any) => sum + (worker.hashrate || 0), 0);
              minerData.totalStats.hashrate += totalHashrate;
            }
            if (stats.totalPaid) {
              minerData.totalStats.totalPaid += stats.totalPaid;
            }
            if (stats.pendingBalance) {
              minerData.totalStats.pendingBalance += stats.pendingBalance;
            }
            // Note: balance info would come from database queries if needed
            if (stats.performance?.workers && Object.keys(stats.performance.workers).length > 0) {
              minerData.totalStats.activeWorkers += Object.keys(stats.performance.workers).length;
            }
          } catch (dbError) {
            console.warn(`Database error for pool ${pool.id}:`, dbError);
            
            // Still include API data even if database fails
            const poolData = {
              poolId: pool.id,
              poolName: pool.coin?.name || pool.id,
              poolSymbol: pool.coin?.type || pool.id.toUpperCase(),
              apiStats: stats,
              performance: stats.performance || {},
              pendingShares: stats.pendingShares || 0,
              pendingBalance: stats.pendingBalance || 0,
              totalPaid: stats.totalPaid || 0,
              todayPaid: stats.todayPaid || 0,
              hashrateHistory: [],
              recentPayments: [],
              summary: null,
              dbError: dbError instanceof Error ? dbError.message : 'Database query failed'
            };

            minerData.pools.push(poolData);
          }
        } else {
        }
      } catch (poolError) {
        console.warn(`Error checking pool ${pool.id} for miner ${address}:`, poolError);
        // Continue checking other pools
      }
    }

    // If no pools found, still return the structure but indicate no activity
    if (minerData.pools.length === 0) {
      minerData.message = 'No mining activity found for this address across any pools';
      minerData.searched_pools = pools.map((p: any) => ({ id: p.id, name: p.coin?.name || p.id }));
    }

    return NextResponse.json({
      success: true,
      data: minerData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking miner address:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 