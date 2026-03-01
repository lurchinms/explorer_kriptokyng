"use client";

import Image from "next/image";

interface CountryFlagProps {
  country: string;
  className?: string;
}

const flagMap: Record<string, { src: string; alt: string; width: number; height: number }> = {
  en: { src: "/flags/us.svg", alt: "United States", width: 24, height: 16 },
  fr: { src: "/flags/fr.svg", alt: "France", width: 24, height: 16 },
  ru: { src: "/flags/ru.svg", alt: "Russia", width: 24, height: 16 },
  ar: { src: "/flags/sa.svg", alt: "Saudi Arabia", width: 24, height: 16 },
  ja: { src: "/flags/jp.svg", alt: "Japan", width: 24, height: 16 },
  zh: { src: "/flags/cn.svg", alt: "China", width: 24, height: 16 },
  es: { src: "/flags/es.svg", alt: "Spain", width: 24, height: 16 },
  de: { src: "/flags/de.svg", alt: "Germany", width: 24, height: 16 },
};

export function CountryFlag({ country, className = "" }: CountryFlagProps) {
  const flag = flagMap[country];
  
  if (!flag) {
    return (
      <span className={`text-lg ${className}`} role="img" aria-label={`${country} flag`}>
        🏳️
      </span>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <Image
        src={flag.src}
        alt={flag.alt}
        width={flag.width}
        height={flag.height}
        className="rounded-sm shadow-sm"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
