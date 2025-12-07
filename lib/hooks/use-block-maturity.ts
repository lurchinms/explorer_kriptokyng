import { useState, useEffect } from 'react';
import { calculateBlockMaturity } from '@/lib/services/block-maturity-service';

interface BlockMaturityInfo {
  blockHeight: number;
  currentNetworkHeight: number;
  confirmations: number;
  confirmationProgress: number;
  isMatured: boolean;
  requiredConfirmations: number;
}

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
      .catch(error => {
        console.error('Failed to calculate block maturity:', error);
        setMaturity(null);
      })
      .finally(() => setLoading(false));
  }, [poolId, blockHeight, status]);

  return { maturity, loading };
}
