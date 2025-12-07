"use client";

import { useState } from "react";
import Image from "next/image";
import { Coins } from "lucide-react";

interface CoinIconProps {
  symbol: string;
  name: string;
  size?: number;
  className?: string;
}

export function CoinIcon({ symbol, name, size = 24, className = "" }: CoinIconProps) {
  const [error, setError] = useState(false);
  
  // Use a direct path to image files (bypassing the API route)
  const iconPath = `/api/coin?symbol=${symbol.toLowerCase()}`;

  if (error) {
    // Get first 2-3 characters of the coin name or symbol
    const displayText = (name.length <= 3 ? name : name.slice(0, 3)).toUpperCase();
    const fontSize = Math.max(8, size * 0.3); // Ensure minimum font size of 8px
    
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 text-primary rounded-full overflow-hidden border border-border ${className}`} 
        style={{ width: size, height: size }}
      >
        <span 
          className="font-bold text-center leading-none"
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayText}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={iconPath}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      quality={100}
      unoptimized={true}
      onError={() => setError(true)}
    />
  );
}