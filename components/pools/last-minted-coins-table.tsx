"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ExternalLink,
  Search,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoinIcon } from "@/components/ui/coin-icon";
import { formatNumber, formatHashrate } from "@/lib/utils/format";
import { useLanguage } from "@/contexts/language-context";

interface Block {
  poolId: string;
  blockHeight: number;
  networkDifficulty: number;
  status: string;
  confirmationProgress: number;
  effort?: number;
  minerEffort?: number;
  transactionConfirmationData: string;
  reward: number;
  infoLink: string;
  hash: string;
  miner: string;
  source: string;
  created: string;
}

interface LastMintedCoinsTableProps {
  initialBlocks?: Block[];
}

export function LastMintedCoinsTable({
  initialBlocks = [],
}: LastMintedCoinsTableProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("created");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const { t } = useLanguage();

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBlocks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/blocks");
      if (response.ok) {
        const data = await response.json();
        setBlocks(data);
        setIsConnected(true);
        setLastUpdate(new Date());
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortValue = (block: Block, column: string): any => {
    switch (column) {
      case "poolId":
        return block.poolId;
      case "blockHeight":
        return block.blockHeight;
      case "status":
        return block.status;
      case "difficulty":
        return block.networkDifficulty;
      case "progress":
        return block.confirmationProgress;
      case "effort":
        return block.effort || 0;
      case "created":
        return new Date(block.created).getTime();
      default:
        return "";
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  function SortIcon({
    active,
    direction,
  }: {
    active: boolean;
    direction: "asc" | "desc";
  }) {
    return active ? (
      direction === "asc" ? (
        <span>▲</span>
      ) : (
        <span>▼</span>
      )
    ) : (
      <span className="opacity-30">▲</span>
    );
  }

  const getPoolDisplayName = (poolId: string) => {
    const poolNames: { [key: string]: string } = {
      yerb: "Yerbas",
      titsolo: "Titcoin Solo",
      tit: "Titcoin",
      aurqubitsolo: "AUR Qubit Solo",
      aurscryptsolo:"AUR Scrypt Solo",
      aurskeinsolo:"AUR Skein Solo",
      mtbcghostrider: "MTBC",
      mtbc: "MTBC",
      acg: "ACG",
      ae: "AE",
      aegs: "AEGS",
      alph: "Alephium",
      bc2: "BC2",
      bgco: "BGCO",
      bkc: "BKC",
      brk: "BRK",
      bsv: "Bitcoin SV",
      btcs: "BTCS",
      chta: "CHTA",
      dem: "DEM",
      fbit: "FBIT",
      fix: "FIX",
      fren: "FREN",
      gemma: "GEMMA",
      glc: "GLC",
      kwr: "KWR",
      kyp: "KYP",
      lcc: "LCC",
      mars: "MARS",
      maxi: "MAXI",
      maza: "MAZA",
      pep: "PEP",
      ppc: "Peercoin",
      rxd: "RXD",
      tenz: "TENZ",
      trmp: "TRMP",
      ytn: "YTN",
      zano: "ZANO",
      // Add more pool mappings as needed
    };
    return poolNames[poolId] || poolId.toUpperCase();
  };

  const getCoinSymbolFromPoolId = (poolId: string) => {
    const poolToCoinMap: { [key: string]: string } = {
      yerb: "yerb",
      titsolo: "tit",
      tit: "tit",
      aurqubitsolo: "aur",
      aur: "aur",
      mtbcghostrider: "mtbc",
      mtbc: "mtbc",
      btc: "btc",
      bch: "bch",
      ltc: "ltc",
      doge: "doge",
      rvn: "rvn",
      dash: "dash",
      dgb: "dgb",
      vtc: "vtc",
      xmr: "xmr",
      firo: "firo",
      rtm: "rtm",
      acg: "acg",
      ae: "ae",
      aegs: "aegs",
      alph: "alph",
      bc2: "bc2",
      bgco: "bgco",
      bkc: "bkc",
      brk: "brk",
      bsv: "bsv",
      btcs: "btcs",
      chta: "chta",
      dem: "dem",
      fbit: "fbit",
      fix: "fix",
      fren: "fren",
      gemma: "gemma",
      glc: "glc",
      kwr: "kwr",
      kyp: "kyp",
      lcc: "lcc",
      mars: "mars",
      maxi: "maxi",
      maza: "maza",
      pep: "pep",
      ppc: "ppc",
      rxd: "rxd",
      tenz: "tenz",
      trmp: "trmp",
      ytn: "ytn",
      zano: "zano",
      // Add more pool to coin mappings as needed
    };
    return poolToCoinMap[poolId.toLowerCase()] || poolId.toLowerCase();
  };

  const getStatusBadge = (status: string, confirmationProgress: number) => {
    const progress = Math.round(confirmationProgress * 100);

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
          >
            Pending {progress > 0 && `(${progress}%)`}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
          >
            Confirmed
          </Badge>
        );
      case "orphaned":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          >
            Orphaned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  // Filter blocks by search
  const filteredBlocks = blocks.filter((block) => {
    const q = search.toLowerCase();
    return (
      block.poolId.toLowerCase().includes(q) ||
      getPoolDisplayName(block.poolId).toLowerCase().includes(q) ||
      block.blockHeight.toString().includes(q) ||
      block.miner.toLowerCase().includes(q) ||
      block.status.toLowerCase().includes(q)
    );
  });

  // Sort filtered blocks and limit to 20 items
  const sortedBlocks = [...filteredBlocks]
    .sort((a, b) => {
      const aValue = getSortValue(a, sortColumn);
      const bValue = getSortValue(b, sortColumn);
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    })
    .slice(0, 20);

  return (
    <div className="w-full mt-4">
      {/* Header with connection status and search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span>
              {isConnected ? t('common.live') : t('common.offline')}
              {" • "}
              {t('common.updated')} {lastUpdate?.toLocaleTimeString() || "N/A"}
              {isLoading && (
                <span className="text-blue-500 ml-2">{t('common.refreshing')}</span>
              )}
            </span>
          </div>
        </div>

        <div className="relative max-w-md w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.searchPlaceholder')}
            className="pl-12 pr-4 py-2 rounded-full bg-muted border-none w-full text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-card/80 rounded-xl border border-border/30 shadow divide-y divide-border">
          <thead>
            <tr>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleSort("poolId")}
                >
                  Pool{" "}
                  <SortIcon
                    active={sortColumn === "poolId"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleSort("blockHeight")}
                >
                  Block Height{" "}
                  <SortIcon
                    active={sortColumn === "blockHeight"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden md:table-cell">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleSort("status")}
                >
                  Status{" "}
                  <SortIcon
                    active={sortColumn === "status"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden lg:table-cell">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleSort("difficulty")}
                >
                  Difficulty{" "}
                  <SortIcon
                    active={sortColumn === "difficulty"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden lg:table-cell">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleSort("effort")}
                >
                  Effort{" "}
                  <SortIcon
                    active={sortColumn === "effort"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground hidden xl:table-cell">
                Miner
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleSort("created")}
                >
                  Time{" "}
                  <SortIcon
                    active={sortColumn === "created"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {sortedBlocks.map((block, index) => (
              <tr
                key={`${block.hash}-${index}`}
                className="hover:bg-muted/40 transition"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="relative min-w-[32px] w-8 h-8">
                      <CoinIcon
                        symbol={getCoinSymbolFromPoolId(block.poolId)}
                        name={getPoolDisplayName(block.poolId)}
                        size={32}
                        className="min-w-[32px] w-8 h-8"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-foreground">
                        {getPoolDisplayName(block.poolId)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {block.poolId}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-base font-semibold">
                    {formatNumber(block.blockHeight, 0)}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                  {getStatusBadge(block.status, block.confirmationProgress)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden lg:table-cell">
                  {formatNumber(block.networkDifficulty, 2)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden lg:table-cell">
                  {block.effort ? `${(block.effort * 100).toFixed(2)}%` : "N/A"}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-muted-foreground text-sm hidden xl:table-cell">
                  <span className="font-mono text-xs">
                    {block.miner.length > 20
                      ? `${block.miner.slice(0, 10)}...${block.miner.slice(
                          -10
                        )}`
                      : block.miner}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(block.created)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <Button variant="ghost" size="sm" asChild className="p-2">
                    <a
                      href={block.infoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View block details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedBlocks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {search
            ? t('common.noResultsFound')
            : t('common.noDataAvailable')}
        </div>
      )}
    </div>
  );
}
