export type StratumConfig = {
  defaultHost: string;
  ssl: {
    enabled: boolean;
    ports?: number[];
  };
  addressMap: {
    [listenAddress: string]: string;
  };
};

export const stratumConfig: StratumConfig = {
  defaultHost: "stratum.kriptokyng.com",
  
  ssl: {
    enabled: false,
    ports: [10001, 10002, 20001] // Optional list of ports that support SSL
  },
  
  // Map API listenAddress values to actual hostnames
  addressMap: {
    "0.0.0.0": "stratum.kriptokyng.com",
    "127.0.0.1": "stratum.kriptokyng.com",
    // Add more mappings as needed
    "192.168.1.100": "stratum.kriptokyng.com",
    "192.168.1.101": "stratum.kriptokyng.com"
  }
};

export type StratumServerLocation = {
  region: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2, lowercase
  city?: string;
  flag: string;
  endpoints: Array<{
    host: string;
    ports: number[];
    ssl: boolean;
    description?: string;
  }>;
};

export const stratumServerLocations: StratumServerLocation[] = [
  {
    region: "North America",
    country: "United States",
    countryCode: "us",
    city: "",
    flag: "🇺🇸",
    endpoints: [
      {
        host: "stratum.kriptokyng.com",
        ports: [3333, 4444],
        ssl: true,
        description: "Primary US node"
      }
    ]
  }
];
