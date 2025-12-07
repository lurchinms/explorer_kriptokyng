export type CreatorConfig = {
  name: string;
  role: string;
  website?: string;
  social?: {
    github?: string;
    twitter?: string;
  };
  contact: {
    email?: string;
    telegram?: string;
    discord?: string;
  };
};

export const creatorConfig: CreatorConfig = {
  name: "Soosho",
  role: "Developer",
  website: "#",
  social: {
    github: "https://github.com/soosho",
    twitter: "https://x.com/tenzura_io",
  },
  contact: {
    email: "soosho@proton.me",
    telegram: "@Sooxu_0",
    discord: "sooxo_0",
  }
};