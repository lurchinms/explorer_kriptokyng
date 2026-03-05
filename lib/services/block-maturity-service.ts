export interface BlockMaturityInfo {
  blockHeight: number;
  currentNetworkHeight: number;
  confirmations: number;
  confirmationProgress: number;
  isMatured: boolean;
  requiredConfirmations: number;
}

export function calculateBlockMaturity(poolId: string, blockHeight: number): Promise<BlockMaturityInfo | null> {
  // Mock implementation - in real app, this would fetch from API
  return new Promise((resolve) => {
    setTimeout(() => {
      const confirmations = Math.floor(Math.random() * 120);
      const requiredConfirmations = 120;
      const confirmationProgress = Math.min(100, (confirmations / requiredConfirmations) * 100);
      
      resolve({
        blockHeight,
        currentNetworkHeight: blockHeight + confirmations,
        confirmations,
        confirmationProgress,
        isMatured: confirmations >= requiredConfirmations,
        requiredConfirmations
      });
    }, 100);
  });
}
