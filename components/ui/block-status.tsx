"use client";

import { Badge } from "@/components/ui/badge";
import { useBlockMaturity } from "@/lib/hooks/use-block-maturity";
import { useLanguage } from "@/contexts/language-context";

interface BlockStatusProps {
  poolId: string;
  blockHeight: number;
  status: string;
  confirmationProgress?: number;
}

export function BlockStatus({ poolId, blockHeight, status, confirmationProgress }: BlockStatusProps) {
  const { t } = useLanguage();
  const { maturity, loading } = useBlockMaturity(poolId, blockHeight, status);

  // Override status based on real-time maturity calculation
  let actualStatus = status;
  let actualProgress = confirmationProgress ?? 0;
  
  if (maturity && !loading) {
    // Use real-time calculation to determine actual status
    if (maturity.isMatured) {
      actualStatus = 'confirmed';
    } else if (status === 'pending') {
      actualStatus = 'pending';
    }
    actualProgress = maturity.confirmationProgress;
  }

  // For confirmed or orphaned blocks, use the determined status
  if (actualStatus === 'confirmed') {
    return (
      <Badge variant="success">
        {t('blocks.confirmed')}
      </Badge>
    );
  }
  
  if (actualStatus === 'orphaned') {
    return (
      <Badge variant="destructive">
        {t('blocks.orphaned')}
      </Badge>
    );
  }

  // For pending blocks, show real-time maturity calculation
  if (actualStatus === 'pending') {
    const progress = actualProgress;
    const confirmations = maturity?.confirmations ?? 0;
    
    return (
      <Badge variant="warning">
        {t('blocks.immature')}
        {maturity && !loading && (
          <span className="ml-1">
            ({Math.round(progress * 100)}%)
          </span>
        )}
        {loading && (
          <span className="ml-1 animate-pulse">...</span>
        )}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      {status}
    </Badge>
  );
}
