export function formatHashrate(hashrate: number, decimals = 2): string {
  if (!hashrate || hashrate === 0) return "0 H/s";
  
  if (hashrate >= 1e18) return `${(hashrate / 1e18).toFixed(decimals)} EH/s`;
  if (hashrate >= 1e15) return `${(hashrate / 1e15).toFixed(decimals)} PH/s`;
  if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(decimals)} TH/s`;
  if (hashrate >= 1e9) return `${(hashrate / 1e9).toFixed(decimals)} GH/s`;
  if (hashrate >= 1e6) return `${(hashrate / 1e6).toFixed(decimals)} MH/s`;
  if (hashrate >= 1e3) return `${(hashrate / 1e3).toFixed(decimals)} KH/s`;
  
  return `${hashrate.toFixed(decimals)} H/s`;
}

/**
 * Format a number with appropriate precision
 * Using a fixed locale for consistent server/client rendering
 */
export function formatNumber(value: number, maximumFractionDigits = 2): string {
  // Always use 'en-US' locale with consistent options for both server and client
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: true,
  }).format(value);
}

/**
 * Format currency with K, M, B suffixes for better readability
 */
export function formatCurrency(value: number, decimals = 2): string {
  if (!value || value === 0) return "0";
  
  if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  
  return value.toFixed(decimals);
}

/**
 * Format number without any separators
 * For values that should display raw numbers like block height
 */
export function formatRawNumber(value: number): string {
  // Convert directly to string without any separators
  return value.toString();
}

export function formatDifficulty(difficulty: number): string {
  if (!difficulty || difficulty === 0) return "0";
  
  // Handle larger difficulties more appropriately
  if (difficulty >= 1e15) return `${(difficulty / 1e15).toFixed(2)}P`;  // Peta
  if (difficulty >= 1e12) return `${(difficulty / 1e12).toFixed(2)}T`;  // Tera
  if (difficulty >= 1e9) return `${(difficulty / 1e9).toFixed(2)}G`;    // Giga
  if (difficulty >= 1e6) return `${(difficulty / 1e6).toFixed(2)}M`;    // Mega
  if (difficulty >= 1e3) return `${(difficulty / 1e3).toFixed(2)}K`;    // Kilo
  
  // For small difficulties use standard formatting with appropriate precision
  return formatNumber(difficulty, difficulty < 10 ? 6 : 2);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Invalid date check
  if (isNaN(date.getTime())) return "Unknown";
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return "Just now";
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // More than a day, use standard date format with 24-hour time
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  
  // Invalid date check
  if (isNaN(date.getTime())) return "Unknown";
  
  // Format the date with 24-hour time
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}