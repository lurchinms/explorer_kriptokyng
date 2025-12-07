'use client';

import { useEffect } from 'react';

export function PoolSearch() {
  useEffect(() => {
    const searchInput = document.getElementById('pool-search') as HTMLInputElement;
    const poolsGrid = document.getElementById('pools-grid');

    if (!searchInput || !poolsGrid) return;

    // Focus search input when page loads
    searchInput.focus();

    const filterPools = () => {
      const searchTerm = searchInput.value.toLowerCase();
      const poolCards = poolsGrid.querySelectorAll('[data-coin-name]');

      poolCards.forEach((card) => {
        const element = card as HTMLElement;
        const coinName = element.dataset.coinName || '';
        const coinSymbol = element.dataset.coinSymbol || '';
        const algorithm = element.dataset.algorithm || '';

        const matches = 
          coinName.includes(searchTerm) || 
          coinSymbol.includes(searchTerm) || 
          algorithm.includes(searchTerm);

        element.style.display = matches ? '' : 'none';
      });
    };

    searchInput.addEventListener('input', filterPools);

    return () => {
      searchInput.removeEventListener('input', filterPools);
    };
  }, []);

  return null;
}