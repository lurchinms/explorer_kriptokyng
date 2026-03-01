'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useBlockchainDetail, useBlockchainBlocks, useBlockchainRichList, useBlockchainOverview, useBlockchainExtraction, useBlockchainNetwork, useBlockchainMarket } from "@/lib/hooks/use-blockchain-data";
import { Stat } from "@/components/ui/stat";
import { TabButton } from "@/components/ui/tab-button";
import { SectionTitle } from "@/components/ui/section-title";

// Helper function to translate with parameters
const translateWithParams = (str: string, params: Record<string, string>): string => {
  let result = str;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

// ---------------------------------------------------------
// DYNAMIC BLOCKCHAIN HEADER DATA
// ---------------------------------------------------------

// ---------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------

interface BlockchainExplorerClientProps {
  blockchainId: string;
  params: { id: string };
}

export default function BlockchainExplorerClient({ blockchainId, params }: BlockchainExplorerClientProps) {
  const { t } = useLanguage();
  
  // Fetch blockchain data using hooks
  const { data: blockchain, isLoading, error } = useBlockchainDetail(blockchainId);
  const { data: blocks, isLoading: blocksLoading } = useBlockchainBlocks(blockchainId);
  const { data: richList, isLoading: richListLoading } = useBlockchainRichList(blockchainId);
  const { data: overview, isLoading: overviewLoading } = useBlockchainOverview(blockchainId);
  const { data: extraction, isLoading: extractionLoading } = useBlockchainExtraction(blockchainId);
  const { data: network, isLoading: networkLoading } = useBlockchainNetwork(blockchainId);
  const { data: market, isLoading: marketLoading } = useBlockchainMarket(blockchainId);
  
  const [tab, setTab] = useState<"blocks" | "richlist" | "overview" | "extraction" | "network" | "market" | "difficulty" | "inflation" | "about">("blocks");

  return (
    <div className="container mx-auto px-4 py-10">

      {/* BACK LINK */}
      <Link href="/blockchains" className="inline-flex items-center text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("blockchain.back_to_blockchains")}
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p className="text-muted-foreground">{t("blockchain.loading_data")}</p>
        </div>
      ) : error ? (
        <div className="flex justify-center py-10">
          <p className="text-red-500">{t("blockchain.error_loading_data")}: {(error as Error).message}</p>
        </div>
      ) : blockchain ? (
        <>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{blockchain.name}</h1>
                <span className="px-3 py-1 text-sm rounded-full bg-muted">{blockchain.symbol}</span>
              </div>
              <p className="text-muted-foreground mt-1">{t("blockchain.blockchain_explorer")}</p>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href={blockchain.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border rounded-md hover:bg-muted transition"
              >
                {t("blockchain.visit_website")}
              </a>
            </div>
          </div>

          {/* TOP STATS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <Stat title={t("blockchain.btc_price")} value={blockchain.price} />
            <Stat title={t("blockchain.usd_price")} value={blockchain.usdPrice} />
            <Stat title={t("blockchain.market_cap")} value={blockchain.marketCap} />
            <Stat title={t("blockchain.hashrate")} value={blockchain.hashrate} />
            <Link href={`/difficulty`} className="block">
              <Stat 
                title={t("blockchain.difficulty")} 
                value={blockchain.difficulty} 
                className="hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors cursor-pointer"
              />
            </Link>
            <Link href={`/inflation`} className="block">
              <Stat 
                title={t("blockchain.outstanding")} 
                value={blockchain.outstanding} 
                className="hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors cursor-pointer"
              />
            </Link>
          </div>
        </>
      ) : null}

      {/* TABS */}
      <div className="flex gap-4 border-b mb-8">
        <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")}>{t("blockchain.latest_blocks")}</TabButton>
        <TabButton active={tab === "richlist"} onClick={() => setTab("richlist")}>{t("blockchain.rich_list")}</TabButton>
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>{t("blockchain.overview")}</TabButton>
        <TabButton active={tab === "extraction"} onClick={() => setTab("extraction")}>{t("blockchain.extraction")}</TabButton>
        <TabButton active={tab === "network"} onClick={() => setTab("network")}>{t("blockchain.network")}</TabButton>
        <TabButton active={tab === "market"} onClick={() => setTab("market")}>{t("blockchain.market")}</TabButton>
        <TabButton active={tab === "about"} onClick={() => setTab("about")}>{t("blockchain.about")}</TabButton>
      </div>

      {/* TAB CONTENT */}
      {tab === "blocks" && (
        <>
          <SectionTitle title={t("blockchain.latest_btc_blocks")} />
          <TableLatestBlocks blockchainId={params.id} t={t} />
        </>
      )}

      {tab === "richlist" && (
        <>
          <SectionTitle title={t("blockchain.richest_btc_addresses")} />
          <TableRichList t={t} />
        </>
      )}

      {tab === "overview" && (
        <>
          <SectionTitle title={t("blockchain.overview_daily_stats")} />
          <TableOverview t={t} />
        </>
      )}

      {tab === "extraction" && (
        <>
          <SectionTitle title={t("blockchain.hashrate_distribution")} />
          <TableExtraction t={t} />
        </>
      )}

      {tab === "network" && (
        <>
          <SectionTitle title={t("blockchain.network_clients")} />
          <TableNetwork t={t} />
        </>
      )}

      {tab === "market" && (
        <>
          <SectionTitle title={t("blockchain.markets_exchanges")} />
          <TableMarket t={t} />
        </>
      )}

      {tab === "difficulty" && (
        <div className="space-y-6">
          <SectionTitle title={t("blockchain.network_difficulty")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">{t("blockchain.current_difficulty")}</h3>
              <p className="text-3xl font-bold">{blockchain?.difficulty || 'N/A'}</p>
              <p className="text-muted-foreground mt-2">
                {translateWithParams(t("blockchain.current_difficulty_desc"), { currency: blockchain?.symbol || 'N/A' })}
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">{t("blockchain.outstanding_supply")}</h3>
              <p className="text-3xl font-bold">{blockchain?.outstanding || 'N/A'}</p>
              <p className="text-muted-foreground mt-2">
                {translateWithParams(t("blockchain.outstanding_supply_desc"), { currency: blockchain?.symbol || 'N/A' })}
              </p>
            </div>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">{t("blockchain.difficulty_chart")}</h3>
            <div className="h-80 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">{t("blockchain.difficulty_chart_placeholder")}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "inflation" && (
        <div className="space-y-6">
          <SectionTitle title={t("blockchain.inflation_supply")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">{t("blockchain.current_inflation_rate")}</h3>
              <p className="text-3xl font-bold">~1.8%</p>
              <p className="text-muted-foreground mt-2">
                {translateWithParams(t("blockchain.current_inflation_desc"), { currency: blockchain?.symbol || 'N/A' })}
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">{t("blockchain.next_halving")}</h3>
              <p className="text-3xl font-bold">~April 2024</p>
              <p className="text-muted-foreground mt-2">
                {t("blockchain.next_halving_desc")}
              </p>
            </div>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">{t("blockchain.inflation_chart")}</h3>
            <div className="h-80 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">{t("blockchain.inflation_chart_placeholder")}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "about" && (
        <>
          <SectionTitle title={t("blockchain.about_bitcoin")} />
          <TableAbout t={t} />
        </>
      )}
    </div>
  );
}
