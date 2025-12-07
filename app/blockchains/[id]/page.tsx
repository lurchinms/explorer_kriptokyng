"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ---------------------------------------------------------
// MOCK BLOCKCHAIN HEADER DATA
// ---------------------------------------------------------

const blockchainData = {
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    price: "1.000262 BTC",
    usdPrice: "$888,854.00",
    marketCap: "$1,773,356.94 M",
    hashrate: "1,175,461.777 PH/s",
    difficulty: "149.30 T",
    outstanding: "19,958,099 BTC",
    website: "https://bitcoin.org",
  },
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    price: "1.000000 ETH",
    usdPrice: "$4,321.50",
    marketCap: "$519,780.00 M",
    hashrate: "1,100.00 TH/s",
    difficulty: "15.50 P",
    outstanding: "120,000,000 ETH",
    website: "https://ethereum.org",
  }
};

const blockchainNetworks = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
];

// ---------------------------------------------------------
// MOCK TABS DATA
// ---------------------------------------------------------

const mockLatestBlocks = [
  { height: 926844, age: "1 minute", tx: 4457, value: "670.5624019 BTC", difficulty: "149.30 T", minedBy: "bc1qzwrryy3…" },
  { height: 926843, age: "4 minutes", tx: 5033, value: "1,712.1670081 BTC", difficulty: "149.30 T", minedBy: "bc1qzwrryy3…" },
  { height: 926842, age: "7 minutes", tx: 3226, value: "1,303.2244231 BTC", difficulty: "149.30 T", minedBy: "3K9X2PP8BNNv…" },
];

const mockRichList = [
  { rank: 1, address: "34xp4vRo…", amount: "248,557.38 BTC", pct: "1.25%", last: "9 days 17 hours" },
  { rank: 2, address: "32M1XRS…", amount: "147,122.89 BTC", pct: "0.74%", last: "18 days 20 hours" },
  { rank: 3, address: "bc1ql49y…", amount: "140,574.38 BTC", pct: "0.70%", last: "35 days 14 hours" },
];

const mockOverview = [
  { date: "2025-12-07 Sun", blocks: 96, height: 926841, interval: "-", tx: 315760, value: "280,635.61 BTC", difficulty: "149.30 T", generated: "299.99990003" },
  { date: "2025-12-06 Sat", blocks: 163, height: 926745, interval: "530.1", tx: 526898, value: "496,106.666 BTC", difficulty: "149.30 T", generated: "509.37495866" },
];

const mockExtraction = [
  { rank: 1, pool: "bc1qzwrryy3…", last100: "24%", last1000: "25.6%" },
  { rank: 2, pool: "37jkPsmB…", last100: "20%", last1000: "10.1%" },
  { rank: 3, pool: "1K6KoYC6…", last100: "12%", last1000: "13.7%" },
  { rank: 4, pool: "ViaBTC", last100: "11%", last1000: "7.7%" },
];

const mockNetworkClients = [
  { rank: 1, client: "Bitcoin Core 27.0", count: 4251, share: "21.1%" },
  { rank: 2, client: "Bitcoin Core 26.0", count: 3184, share: "15.8%" },
  { rank: 3, client: "Satoshi:0.1.0", count: 2271, share: "11.3%" },
  { rank: 4, client: "Bitcoin Knots", count: 1244, share: "6.1%" },
];

// ---------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------

export default function BlockchainExplorer({ params }: { params: { id: string } }) {
  const blockchainId = params.id || 'bitcoin';
  const mockBlockchain = blockchainData[blockchainId as keyof typeof blockchainData] || blockchainData.bitcoin;
  const [tab, setTab] = useState<"blocks" | "richlist" | "overview" | "extraction" | "network" | "market" | "difficulty" | "inflation" | "about">("blocks");

  return (
    <div className="container mx-auto px-4 py-10">

      {/* BACK LINK */}
      <Link href="/blockchains" className="inline-flex items-center text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blockchains
      </Link>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10">
        {/* Network Navigation */}
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          {blockchainNetworks.map((network) => (
            <Link
              key={network.id}
              href={`/blockchains/${network.id}`}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                blockchainId === network.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {network.name} ({network.symbol})
            </Link>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{mockBlockchain.name}</h1>
            <span className="px-3 py-1 text-sm rounded-full bg-muted">{mockBlockchain.symbol}</span>
          </div>
          <p className="text-muted-foreground mt-1">Blockchain Explorer</p>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href={mockBlockchain.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border rounded-md hover:bg-muted transition"
          >
            Visit Website
          </a>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <Stat title="BTC Price" value={mockBlockchain.price} />
        <Stat title="USD Price" value={mockBlockchain.usdPrice} />
        <Stat title="Market Cap" value={mockBlockchain.marketCap} />
        <Stat title="Hashrate" value={mockBlockchain.hashrate} />
        <Link href={`/difficulty`} className="block">
          <Stat 
            title="Difficulty" 
            value={mockBlockchain.difficulty} 
            className="hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors cursor-pointer"
          />
        </Link>
        <Link href={`/inflation`} className="block">
          <Stat 
            title="Outstanding" 
            value={mockBlockchain.outstanding} 
            className="hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors cursor-pointer"
          />
        </Link>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b mb-8">
        <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")}>Latest Blocks</TabButton>
        <TabButton active={tab === "richlist"} onClick={() => setTab("richlist")}>Rich List</TabButton>
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabButton>
        <TabButton active={tab === "extraction"} onClick={() => setTab("extraction")}>Extraction</TabButton>
        <TabButton active={tab === "network"} onClick={() => setTab("network")}>Network</TabButton>
        <TabButton active={tab === "market"} onClick={() => setTab("market")}>Market</TabButton>
        <TabButton active={tab === "about"} onClick={() => setTab("about")}>About</TabButton>
      </div>

      {/* TAB CONTENT */}
      {tab === "blocks" && (
        <>
          <SectionTitle title="Latest BTC Blocks" />
          <TableLatestBlocks blockchainId={params.id} />
        </>
      )}

      {tab === "richlist" && (
        <>
          <SectionTitle title="Richest BTC Addresses" />
          <TableRichList />
        </>
      )}

      {tab === "overview" && (
        <>
          <SectionTitle title="Overview (Daily Stats)" />
          <TableOverview />
        </>
      )}

      {tab === "extraction" && (
        <>
          <SectionTitle title="Hashrate Distribution" />
          <TableExtraction />
        </>
      )}

      {tab === "network" && (
        <>
          <SectionTitle title="Network Clients (Dummy Data)" />
          <TableNetwork />
        </>
      )}

      {tab === "market" && (
        <>
          <SectionTitle title="Markets & Exchanges" />
          <TableMarket />
        </>
      )}

      {tab === "difficulty" && (
        <div className="space-y-6">
          <SectionTitle title="Network Difficulty" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Current Difficulty</h3>
              <p className="text-3xl font-bold">149.30 T</p>
              <p className="text-muted-foreground mt-2">
                The current mining difficulty of the Bitcoin network
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Outstanding Supply</h3>
              <p className="text-3xl font-bold">19,958,099 BTC</p>
              <p className="text-muted-foreground mt-2">
                Total number of Bitcoins mined so far
              </p>
            </div>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Difficulty Chart</h3>
            <div className="h-80 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Difficulty chart will be displayed here</p>
            </div>
          </div>
        </div>
      )}

      {tab === "inflation" && (
        <div className="space-y-6">
          <SectionTitle title="Inflation & Supply" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Current Inflation Rate</h3>
              <p className="text-3xl font-bold">~1.8%</p>
              <p className="text-muted-foreground mt-2">
                Annual inflation rate of Bitcoin
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Next Halving</h3>
              <p className="text-3xl font-bold">~April 2024</p>
              <p className="text-muted-foreground mt-2">
                Estimated date of next block reward halving
              </p>
            </div>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Inflation Chart</h3>
            <div className="h-80 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Inflation chart will be displayed here</p>
            </div>
          </div>
        </div>
      )}

      {tab === "about" && (
        <>
          <SectionTitle title="About Bitcoin" />
          <TableAbout />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// TABLE COMPONENTS
// ---------------------------------------------------------

function TableLatestBlocks({ blockchainId }: { blockchainId: string }) {
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">Block Height</th>
            <th>Age</th>
            <th>Transactions</th>
            <th>Value Out</th>
            <th>Difficulty</th>
            <th>Extracted By</th>
          </tr>
        </thead>
        <tbody>
          {mockLatestBlocks.map((b, i) => (
            <tr key={i} className="border-b last:border-none hover:bg-muted/50">
              <td className="py-2">
                <Link href={`/blockchains/${blockchainId}/blocks/${b.height}`} className="text-primary hover:underline">
                  {b.height.toLocaleString()}
                </Link>
              </td>
              <td>{b.age}</td>
              <td>{b.tx.toLocaleString()}</td>
              <td>{b.value}</td>
              <td>{b.difficulty}</td>
              <td className="text-primary">{b.minedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRichList() {
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">Rank</th>
            <th>Address</th>
            <th>Amount</th>
            <th>Percent</th>
            <th>Last Change</th>
          </tr>
        </thead>
        <tbody>
          {mockRichList.map((r, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{r.rank}</td>
              <td className="text-primary">{r.address}</td>
              <td>{r.amount}</td>
              <td>{r.pct}</td>
              <td>{r.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableOverview() {
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">Date / Time</th>
            <th>Blocks</th>
            <th>Height</th>
            <th>Interval</th>
            <th>Transactions</th>
            <th>Value Out</th>
            <th>Difficulty</th>
            <th>Generated</th>
          </tr>
        </thead>
        <tbody>
          {mockOverview.map((row, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{row.date}</td>
              <td>{row.blocks}</td>
              <td>{row.height}</td>
              <td>{row.interval}</td>
              <td>{row.tx.toLocaleString()}</td>
              <td>{row.value}</td>
              <td>{row.difficulty}</td>
              <td>{row.generated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableExtraction() {
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">Rank</th>
            <th>Pool / Miner</th>
            <th>Last 100</th>
            <th>Last 1000</th>
          </tr>
        </thead>
        <tbody>
          {mockExtraction.map((row, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{row.rank}</td>
              <td className="text-primary">{row.pool}</td>
              <td>{row.last100}</td>
              <td>{row.last1000}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableNetwork() {
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">Rank</th>
            <th>Client</th>
            <th>Node Count</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {mockNetworkClients.map((row, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{row.rank}</td>
              <td className="text-primary">{row.client}</td>
              <td>{row.count.toLocaleString()}</td>
              <td>{row.share}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------
// NEW MARKET SECTION
// ---------------------------------------------------------

function TableMarket() {
  const markets = [
    { exchange: 'Binance', pair: 'USDT', price: '$88,952.00', volume: '$2,573,728.65', share: '11.80%' },
    { exchange: 'Coinbase', pair: 'USDT', price: '$88,945.20', volume: '$1,845,321.45', share: '8.45%' },
    { exchange: 'Kraken', pair: 'USDT', price: '$88,948.75', volume: '$1,234,567.89', share: '5.65%' },
    { exchange: 'Bitfinex', pair: 'USDT', price: '$88,950.30', volume: '$987,654.32', share: '4.52%' },
    { exchange: 'Huobi', pair: 'USDT', price: '$88,949.80', volume: '$876,543.21', share: '4.01%' },
  ];

  return (
    <div className="mb-16">
      <div className="bg-muted/30 rounded-lg border overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b">
          <h3 className="font-semibold">Markets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="text-left p-3">Exchange</th>
                <th className="text-left p-3">Markets</th>
                <th className="text-right p-3">USD Price</th>
                <th className="text-right p-3">24h Volume</th>
                <th className="text-right p-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {markets.map((market, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-muted mr-2 flex items-center justify-center text-xs">
                        {market.exchange[0]}
                      </div>
                      {market.exchange}
                    </div>
                  </td>
                  <td className="p-3">{market.pair}</td>
                  <td className="p-3 text-right font-medium">{market.price}</td>
                  <td className="p-3 text-right">{market.volume}</td>
                  <td className="p-3 text-right">{market.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// ABOUT SECTION
// ---------------------------------------------------------

function TableAbout() {
  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Information Table */}
        <div className="flex-1">
          <div className="bg-muted/30 rounded-lg border overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b">
              <h3 className="font-semibold">Information</h3>
            </div>
            <div className="divide-y">
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">Name (Tag)</div>
                <div className="w-2/3 font-medium">Bitcoin (BTC)</div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">Algorithm</div>
                <div className="w-2/3">SHA-256</div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">Wallet Version</div>
                <div className="w-2/3">v26.0</div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">Social Nets</div>
                <div className="w-2/3 flex gap-2">
                  <a href="#" className="text-primary hover:underline">Website</a>
                  <a href="#" className="text-primary hover:underline">Twitter</a>
                  <a href="#" className="text-primary hover:underline">GitHub</a>
                </div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">First block</div>
                <div className="w-2/3">2009-01-03 19:15:05</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className="w-full md:w-64">
          <div className="bg-muted/30 rounded-lg border overflow-hidden h-full">
            <div className="bg-muted px-4 py-2 border-b">
              <h3 className="font-semibold">Logo</h3>
            </div>
            <div className="p-6 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-4xl">₿</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// UI HELPERS
// ---------------------------------------------------------

function TabButton({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-1 border-b-2 transition ${
        active
          ? "border-primary text-primary font-medium"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ title, value, className = '' }: { title: string; value: string; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-muted-foreground">{title}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold mb-4 mt-6">{title}</h2>;
}
