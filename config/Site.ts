export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  ogImage?: string;
  keywords: string[];
  links: {
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
  };
  contact: {
    email?: string;
    supportEmail?: string;
  };
  ui: {
    logo: {
      light: string;
      dark: string;
    };
  };
  api: {
    baseUrl: string;
    timeout?: number;
    websocket?: {
      notificationsUrl: string;
      reconnectInterval?: number;
      maxReconnectAttempts?: number;
    };
  };
};

export const siteConfig: SiteConfig = {
  name: "kriptokyng",
  tagline: " Kriptokyng",
  description: " Kriptokyng provides a fast, reliable, and intuitive blockchain explorer experience — track your transactions, blocks, and network performance in real-time.",
  url: "https://kriptokyng.xyz",
  ogImage: "/logo-mini.png",
  keywords: ["crypto mining pool", "bitcoin mining pool", "ethereum mining pool", "best mining pool", "low fee mining pool", "high hashrate mining pool", "mining pool stats", "mining pool dashboard", "gpu mining pool", "solo mining pool", "multi-coin mining pool", "mining pool payouts", "stratum mining pool", "heroic hashers", "mining dashboard", "track hashrate mining", "cryptocurrency mining pool"],
  links: {
    github: "https://github.com/lurchinms",
    twitter: "https://x.com/kriptokyng",
    discord: "https://discord.gg/USABG88pdZ",
  },
  contact: {
    email: "kriptokyng@gmail.com",
    supportEmail: "kriptokyng@gmail.com",
  },
  ui: {
    logo: {
      light: "/logo-light.svg",
      dark: "/logo-dark.svg",
    },
  },
  api: {
    baseUrl: "https://api.kriptokyng.com/api",
    timeout: 10000, // 10 seconds
    websocket: {
      notificationsUrl: "wss://api.kriptokyng.com/notifications",
      reconnectInterval: 5000, // 5 seconds
      maxReconnectAttempts: 5,
    },
  },
};
