"use client";

import { useState } from "react";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/Site";

interface Blockchain {
  id: number;
  name: string;
  symbol: string;
  blockHeight: number;
  age: string;
  transactions: number;
  difficulty: string;
  price: string;
  marketCap: string;
  algorithm?: string;
  blockTime?: string;
  status?: string;
  minPayout?: number | string;
  fee?: string;
  website?: string;
}

const blockchains: Blockchain[] = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    blockHeight: 810907,
    age: "< 1 min",
    transactions: 2145,
    difficulty: "81.97 T",
    price: "$67,834.12",
    marketCap: "$1.33T"
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    blockHeight: 19245678,
    age: "2 mins",
    transactions: 1245,
    difficulty: "15.67 T",
    price: "$3,542.76",
    marketCap: "$425.13B"
  },
  {
    id: 3,
    name: "Binance Coin",
    symbol: "BNB",
    blockHeight: 42189765,
    age: "3 mins",
    transactions: 3456,
    difficulty: "5.43 T",
    price: "$567.34",
    marketCap: "$98.76B"
  },
  {
    id: 4,
    name: "Cardano",
    symbol: "ADA",
    blockHeight: 9876543,
    age: "5 mins",
    transactions: 987,
    difficulty: "2.34 P",
    price: "$0.45",
    marketCap: "$15.89B",
    algorithm: "",
    blockTime: "",
    status: "",
    minPayout: 0,
    fee: "",
    website: ""
  },
  {
    id: 5,
    name: "Flux",
    symbol: "FLUX",
    blockHeight: 1234567,
    age: "2 mins",
    transactions: 500,
    difficulty: "1.23 T",
    price: "$0.75",
    marketCap: "$500M",
    algorithm: "Kadena",
    blockTime: "~2m",
    status: "Active",
    minPayout: 5,
    fee: "1%",
    website: "https://runonflux.io"
  },
  {
    id: 6,
    name: "Nexa",
    symbol: "NEXA",
    blockHeight: 2345678,
    age: "3 mins",
    transactions: 750,
    difficulty: "2.34 P",
    price: "$0.10",
    marketCap: "$200M",
    algorithm: "SHA256d",
    blockTime: "~2m",
    status: "Active",
    minPayout: 1000,
    fee: "1%",
    website: "https://nexa.org"
  },
  {
    id: 7,
    name: "Kaspa",
    symbol: "KAS",
    blockHeight: 3456789,
    age: "< 1 min",
    transactions: 1200,
    difficulty: "5.67 T",
    price: "$0.25",
    marketCap: "$3.5B",
    algorithm: "kHeavyHash",
    blockTime: "~1s",
    status: "Active",
    minPayout: 5000,
    fee: "1%",
    website: "https://kaspa.org"
  },
  {
    id: 8,
    name: "BitcoinZ",
    symbol: "BTCZ",
    blockHeight: 4567890,
    age: "5 mins",
    transactions: 300,
    difficulty: "0.98 T",
    price: "$0.0005",
    marketCap: "$50M",
    algorithm: "ZelHash",
    blockTime: "~2.5m",
    status: "Active",
    minPayout: 1000,
    fee: "1%",
    website: "https://getbtcz.com"
  },
  {
    id: 9,
    name: "ZelCash",
    symbol: "ZEL",
    blockHeight: 3456789,
    age: "3 mins",
    transactions: 450,
    difficulty: "1.5 T",
    price: "$0.15",
    marketCap: "$75M",
    algorithm: "ZelHash",
    blockTime: "~2m",
    status: "Active",
    minPayout: 10,
    fee: "1%",
    website: "https://zel.network"
  },
  {
    id: 10,
    name: "Zano",
    symbol: "ZANO",
    blockHeight: 2345678,
    age: "4 mins",
    transactions: 600,
    difficulty: "2.1 T",
    price: "$0.80",
    marketCap: "$120M",
    algorithm: "ProgPoW",
    blockTime: "~2m",
    status: "Active",
    minPayout: 5,
    fee: "1%",
    website: "https://zano.org"
  },
  {
    id: 11,
    name: "Monero",
    symbol: "XMR",
    blockHeight: 34567890,
    age: "2 mins",
    transactions: 1800,
    difficulty: "45.67 T",
    price: "$180.50",
    marketCap: "$3.2B",
    algorithm: "RandomX",
    blockTime: "~2m",
    status: "Active",
    minPayout: 0.1,
    fee: "1%",
    website: "https://www.getmonero.org"
  },
  {
    id: 12,
    name: "Monero Classic",
    symbol: "XMC",
    blockHeight: 1234567,
    age: "5 mins",
    transactions: 200,
    difficulty: "1.23 T",
    price: "$0.50",
    marketCap: "$25M",
    algorithm: "RandomX",
    blockTime: "~2m",
    status: "Active",
    minPayout: 1,
    fee: "1%",
    website: "#"
  },
  {
    id: 13,
    name: "Wownero",
    symbol: "WOW",
    blockHeight: 2345678,
    age: "3 mins",
    transactions: 350,
    difficulty: "1.5 T",
    price: "$0.25",
    marketCap: "$40M",
    algorithm: "RandomWOW",
    blockTime: "~2m",
    status: "Active",
    minPayout: 10,
    fee: "1%",
    website: "https://wownero.org"
  },
  {
    id: 14,
    name: "Monero Ocean",
    symbol: "XMO",
    blockHeight: 1234567,
    age: "2 mins",
    transactions: 400,
    difficulty: "2.34 T",
    price: "$0.75",
    marketCap: "$60M",
    algorithm: "RandomX",
    blockTime: "~2m",
    status: "Active",
    minPayout: 0.1,
    fee: "1%",
    website: "https://moneroocean.stream"
  },
  {
    id: 15,
    name: "Raptoreum",
    symbol: "RTM",
    blockHeight: 2345678,
    age: "1 min",
    transactions: 600,
    difficulty: "3.45 T",
    price: "$0.02",
    marketCap: "$80M",
    algorithm: "GhostRider",
    blockTime: "~1m",
    status: "Active",
    minPayout: 100,
    fee: "1%",
    website: "https://raptoreum.com"
  },
  {
    id: 16,
    name: "Monkey Project",
    symbol: "MONK",
    blockHeight: 1234567,
    age: "4 mins",
    transactions: 250,
    difficulty: "1.23 T",
    price: "$0.10",
    marketCap: "$15M",
    algorithm: "RandomX",
    blockTime: "~2m",
    status: "Active",
    minPayout: 100,
    fee: "1%",
    website: "#"
  },
  {
    id: 17,
    name: "Safex Cash",
    symbol: "SFX",
    blockHeight: 2345678,
    age: "2 mins",
    transactions: 400,
    difficulty: "2.34 T",
    price: "$0.05",
    marketCap: "$30M",
    algorithm: "RandomSFX",
    blockTime: "~1m",
    status: "Active",
    minPayout: 100,
    fee: "1%",
    website: "https://safex.io"
  },
  {
    id: 18,
    name: "Scala",
    symbol: "XLA",
    blockHeight: 1234567,
    age: "3 mins",
    transactions: 350,
    difficulty: "1.5 T",
    price: "$0.02",
    marketCap: "$20M",
    algorithm: "Panthera",
    blockTime: "~2m",
    status: "Active",
    minPayout: 50,
    fee: "1%",
    website: "https://scalaproject.io"
  },
  {
    id: 19,
    name: "Grin",
    symbol: "GRIN",
    blockHeight: 2345678,
    age: "1 min",
    transactions: 500,
    difficulty: "2.34 T",
    price: "$0.25",
    marketCap: "$50M",
    algorithm: "Cuckarood29",
    blockTime: "~1m",
    status: "Active",
    minPayout: 1,
    fee: "1%",
    website: "https://grin.mw"
  },
  {
    id: 20,
    name: "Beam",
    symbol: "BEAM",
    blockHeight: 1234567,
    age: "2 mins",
    transactions: 600,
    difficulty: "1.23 T",
    price: "$0.35",
    marketCap: "$90M",
    algorithm: "BeamHash III",
    blockTime: "~1m",
    status: "Active",
    minPayout: 1,
    fee: "1%",
    website: "https://beam.mw"
  },
  {
    id: 21,
    name: "Aeternity",
    symbol: "AE",
    blockHeight: 2345678,
    age: "3 mins",
    transactions: 400,
    difficulty: "2.34 T",
    price: "$0.15",
    marketCap: "$60M",
    algorithm: "CuckooCycle",
    blockTime: "~3m",
    status: "Active",
    minPayout: 10,
    fee: "1%",
    website: "https://aeternity.com"
  },
  {
    id: 22,
    name: "Bitcoin Gold",
    symbol: "BTG",
    blockHeight: 1234567,
    age: "8 mins",
    transactions: 800,
    difficulty: "3.45 T",
    price: "$25.50",
    marketCap: "$450M",
    algorithm: "Zhash",
    blockTime: "~10m",
    status: "Active",
    minPayout: 0.1,
    fee: "1%",
    website: "https://bitcoingold.org"
  }
];

const ITEMS_PER_PAGE = 10;

export default function BlockchainsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const filteredBlockchains = blockchains.filter(blockchain => 
    blockchain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blockchain.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBlockchains.length / ITEMS_PER_PAGE);
  const paginatedBlockchains = filteredBlockchains.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleDetails = (id: number) => {
    setShowDetails(showDetails === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blockchains</h1>
          </div>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crypto-currency</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Block Height</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Market Cap</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedBlockchains.map((blockchain) => (
                  <tr 
                    key={blockchain.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => window.location.href = `/blockchains/${blockchain.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-muted text-foreground font-medium">
                          {blockchain.symbol[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{blockchain.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{blockchain.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {blockchain.blockHeight.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {blockchain.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {blockchain.transactions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-mono">
                      {blockchain.difficulty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                      {blockchain.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {blockchain.marketCap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredBlockchains.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredBlockchains.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-background text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-foreground text-background border-foreground'
                            : 'bg-background hover:bg-muted border-border text-foreground'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-background text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>


        <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-6 py-5 border-b">
            <h3 className="text-lg font-medium">Disclaimer</h3>
          </div>
          <div className="px-6 py-5">
            <p className="text-muted-foreground mb-4">
              This site provides blockchain explorers for several crypto-currencies.
              We do not provide any currency exchange, wallet, or money services. We only present public blockchain data.
            </p>
            <p className="text-muted-foreground">
              Please review our full <a href="/terms" className="text-primary hover:underline font-medium">Terms of Service</a> for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
