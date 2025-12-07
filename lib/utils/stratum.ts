import { stratumConfig } from "@/config/Stratum";
import { StratumServer } from "@/lib/types/miningcore";

export function getStratumUrl(listenAddress: string, port: string | number): string {
  const hostname = stratumConfig.addressMap[listenAddress] || stratumConfig.defaultHost;

  const useSSL = stratumConfig.ssl.enabled && 
    (stratumConfig.ssl.ports?.includes(Number(port)) ?? false);

  const protocol = useSSL ? "stratum+ssl" : "stratum+tcp";
  
  return `${protocol}://${hostname}:${port}`;
}

// New function to get stratum URL from pool's stratumServers
export function getStratumUrlFromServer(server: StratumServer, port: string | number): string {
  // For now, we'll use stratum+tcp as the default protocol
  // This can be enhanced later to support SSL based on server configuration
  const protocol = "stratum+tcp";
  
  return `${protocol}://${server.host}:${port}`;
}

// Helper function to get all available stratum servers from a pool
export function getAvailableServers(stratumServers: Record<string, StratumServer> | undefined): Array<{
  key: string;
  server: StratumServer;
  countryCode: string;
}> {
  if (!stratumServers) return [];
  
  return Object.entries(stratumServers).map(([key, server]) => ({
    key,
    server,
    countryCode: key.toLowerCase() // Use the key as country code (us, sg, global, etc.)
  }));
}

export function getMiningInstructions() {
  return {
    username: "YOUR_WALLET_ADDRESS",
    password: "x", // Default for most pools
    workerName: "optional_worker_name" // Some pools support this
  };
}