"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface ServerLocation {
  region: string;
  country: string;
  countryCode: string;
  city?: string;
  host: string;
  ports: number[];
  latency: number | 'offline' | null;
}

async function pingHost(host: string): Promise<number | 'offline'> {
  const maxAttempts = 3;
  const results: number[] = [];
  
  try {
    // Perform multiple ping attempts
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const startTime = performance.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`https://${host}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        clearTimeout(timeout);
        const endTime = performance.now();
        
        if (response.ok) {
          try {
            const data = await response.json();
            // Check if the response indicates stratum or load balancer is alive
            if (data.status === 'ok' && (data.message === 'Stratum is alive' || data.message === 'Load Balancer is alive')) {
              const pingTime = Math.round(endTime - startTime);
              results.push(pingTime);
            }
          } catch (jsonError) {
            // Response wasn't JSON or wasn't the expected format
            // Continue to next attempt
          }
        }
        
        // Small delay between attempts to avoid overwhelming the server
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        // Network error, timeout, or other failure for this attempt
        // Continue to next attempt
      }
    }
    
    // If we have at least 2 successful pings, calculate average
    if (results.length >= 2) {
      // Remove outliers (highest value) if we have 3 results
      if (results.length === 3) {
        results.sort((a, b) => a - b);
        results.pop(); // Remove the highest ping
      }
      
      // Return average of remaining pings
      return Math.round(results.reduce((sum, ping) => sum + ping, 0) / results.length);
    } else if (results.length === 1) {
      // If only one successful ping, return it
      return results[0];
    } else {
      // No successful pings
      return 'offline';
    }
  } catch (error) {
    return 'offline';
  }
}

// Function to get flag image URL based on country code
const getFlagImageUrl = (code: string): string => {
  // Handle special cases
  if (code.toLowerCase() === 'global') {
    // Use a generic globe icon for global servers
    return 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/un.svg'; // UN flag for global
  }
  
  // Use the country code directly for flag-icons
  return `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${code.toLowerCase()}.svg`;
};

export function StratumLocationTable() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedHost, setCopiedHost] = useState<string | null>(null);
  
  // Static server locations data
  const [servers, setServers] = useState<ServerLocation[]>([
    {
      region: "North America",
      country: "United States",
      countryCode: "us",
      city: "New York",
      host: "stratum.kriptokyng.com",
      ports: [3032, 3033, 3034],
      latency: null
    },
    {
      region: "Europe",
      country: "Germany",
      countryCode: "de",
      city: "Frankfurt",
      host: "eu.stratum.kriptokyng.com",
      ports: [3032, 3033, 3034],
      latency: null
    },
    {
      region: "Asia",
      country: "Singapore",
      countryCode: "sg",
      city: "Singapore",
      host: "sg.stratum.kriptokyng.com",
      ports: [3032, 3033, 3034],
      latency: null
    }
  ]);

  const handleCopy = (host: string) => {
    navigator.clipboard.writeText(host);
    setCopiedHost(host);
    setTimeout(() => setCopiedHost(null), 1200);
  };

  // Simulate latency measurement on component mount
  useEffect(() => {
    const measureLatency = async () => {
      setIsLoading(true);
      
      // Simulate latency measurement
      const updatedServers = await Promise.all(servers.map(async (server) => {
        try {
          // This is a simulation - in a real app, you would ping the actual servers
          const latency = Math.floor(Math.random() * 300) + 20; // Random latency between 20-320ms
          return { ...server, latency };
        } catch (error) {
          return { ...server, latency: 'offline' as const };
        }
      }));
      
      setServers(updatedServers);
      setIsLoading(false);
    };
    
    measureLatency();
    
    // Set up interval to refresh latency periodically
    const interval = setInterval(measureLatency, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Find the fastest server
  const fastestLatency = Math.min(
    ...servers
      .map(s => typeof s.latency === 'number' ? s.latency : Infinity)
      .filter(latency => latency !== Infinity)
  );
  
  // Sort servers by latency (fastest first, then measuring, then offline)
  const sortedServers = [...servers].sort((a, b) => {
    // Handle offline status
    if (a.latency === 'offline' && b.latency === 'offline') return 0;
    if (a.latency === 'offline') return 1;
    if (b.latency === 'offline') return -1;
    
    // Handle measuring status
    if (a.latency === null && b.latency === null) return 0;
    if (a.latency === null) return 1;
    if (b.latency === null) return -1;
    
    // Both have latency values, sort by latency
    return a.latency - b.latency;
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-4">
        <div className="text-center py-8">
          <div className="animate-pulse">Loading server information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 overflow-x-auto">
      <table className="min-w-full bg-card/80 rounded-xl border border-border/30 shadow divide-y divide-border">
        <thead>
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Location</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Region</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Endpoint</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Latency</th>
          </tr>
        </thead>
        <tbody>
          {sortedServers.map((server) => (
            <tr key={server.host} className="hover:bg-muted/40 transition">
              <td className="px-6 py-5 whitespace-nowrap flex items-center gap-3">
                <img
                  src={getFlagImageUrl(server.countryCode)}
                  alt={server.country}
                  className="w-[30px] h-[22px] rounded-sm"
                  width={30}
                  height={22}
                  onError={e => { 
                    // Fallback to UN flag if country flag fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/un.svg';
                  }}
                />
                <span className="font-semibold text-base text-foreground">
                  {server.country}
                </span>
                {server.city && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {server.city}
                  </span>
                )}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm">
                {server.region}
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="bg-muted/80 px-3 py-1 rounded font-mono text-base text-primary shadow-inner flex items-center gap-2">
                  {server.host}
                  <button
                    className="ml-2 p-1 rounded hover:bg-muted/60 transition"
                    onClick={() => handleCopy(server.host)}
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copiedHost === server.host && (
                    <span className="ml-2 text-xs text-green-600">Copied!</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Ports: {server.ports.join(', ')}
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                {server.latency === null ? (
                  <span className="text-muted-foreground text-base font-semibold animate-pulse">
                    Measuring...
                  </span>
                ) : server.latency === 'offline' ? (
                  <span className="text-red-500 text-base font-semibold">
                    Offline
                  </span>
                ) : (
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <span 
                      className={`relative flex h-4 w-4 mr-1 ${
                        server.latency < 100 
                          ? 'bg-green-500' 
                          : server.latency < 300 
                            ? 'bg-yellow-400' 
                            : 'bg-red-500'
                      } rounded-full items-center justify-center`}
                    >
                      <span 
                        className={`absolute animate-ping inline-flex h-full w-full rounded-full ${
                          server.latency < 100 
                            ? 'bg-green-400' 
                            : server.latency < 300 
                              ? 'bg-yellow-300' 
                              : 'bg-red-400'
                        } opacity-75`}
                      ></span>
                      <span 
                        className={`relative inline-flex rounded-full h-3 w-3 ${
                          server.latency < 100 
                            ? 'bg-green-500' 
                            : server.latency < 300 
                              ? 'bg-yellow-400' 
                              : 'bg-red-500'
                        }`}
                      ></span>
                    </span>
                    <span 
                      className={`${
                        server.latency < 100 
                          ? 'text-green-500' 
                          : server.latency < 300 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                      }`}
                    >
                      {Math.round(server.latency)}
                    </span>
                    <span className="text-base font-normal ml-1">ms</span>
                    {server.latency === fastestLatency && (
                      <Badge className="ml-2 bg-green-600 text-white">
                        Fastest
                      </Badge>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};