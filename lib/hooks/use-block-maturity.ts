import { useState, useEffect } from 'react';
import { calculateBlockMaturity, BlockMaturityInfo } from '@/lib/services/block-maturity-service';

export function useBlockMaturity(poolId: string, blockHeight: number, status: string) {
  const [maturity, setMaturity] = useState<BlockMaturityInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only calculate for pending blocks
    if (status !== 'pending' || !poolId || !blockHeight) {
      setMaturity(null);
      return;
    }

    setLoading(true);
    calculateBlockMaturity(poolId, blockHeight)
      .then(setMaturity)
      .catch((error: unknown) => {
        console.error('Failed to calculate block maturity:', error);
        setMaturity(null);
      })
      .finally(() => setLoading(false));
  }, [poolId, blockHeight, status]);

  return { maturity, loading };
}
