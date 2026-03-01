import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBlockchainDetail, useBlockchainBlocks, useBlockchainRichList, useBlockchainOverview, useBlockchainExtraction, useBlockchainNetwork, useBlockchainMarket } from "@/lib/hooks/use-blockchain-data";
import BlockchainExplorerClient from "./client";

// ---------------------------------------------------------
// DYNAMIC BLOCKCHAIN HEADER DATA
// ---------------------------------------------------------

export default async function BlockchainExplorer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const blockchainId = resolvedParams.id;
  
  return <BlockchainExplorerClient blockchainId={blockchainId} params={resolvedParams} />;
}

// ---------------------------------------------------------
// TABLE COMPONENTS
// ---------------------------------------------------------

function TableLatestBlocks({ blockchainId, t }: { blockchainId: string; t: (key: string) => string }) {
  const { data: blocks, isLoading, error } = useBlockchainBlocks(blockchainId);
  
  if (isLoading) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.block_height")}</th>
              <th>{t("blockchain.age")}</th>
              <th>{t("blockchain.transactions")}</th>
              <th>{t("blockchain.value_out")}</th>
              <th>{t("blockchain.difficulty_column")}</th>
              <th>{t("blockchain.extracted_by")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none hover:bg-muted/50">
              <td className="py-2" colSpan={6}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.loading_data")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  if (error || !blocks || blocks.length === 0) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.block_height")}</th>
              <th>{t("blockchain.age")}</th>
              <th>{t("blockchain.transactions")}</th>
              <th>{t("blockchain.value_out")}</th>
              <th>{t("blockchain.difficulty_column")}</th>
              <th>{t("blockchain.extracted_by")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none hover:bg-muted/50">
              <td className="py-2" colSpan={6}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.no_data_available")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">{t("blockchain.block_height")}</th>
            <th>{t("blockchain.age")}</th>
            <th>{t("blockchain.transactions")}</th>
            <th>{t("blockchain.value_out")}</th>
            <th>{t("blockchain.difficulty_column")}</th>
            <th>{t("blockchain.extracted_by")}</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block, i) => (
            <tr key={i} className="border-b last:border-none hover:bg-muted/50">
              <td className="py-2">
                <Link href={`/blockchains/${blockchainId}/blocks/${block.height}`} className="text-primary hover:underline">
                  {block.height.toLocaleString()}
                </Link>
              </td>
              <td>{block.age}</td>
              <td>{block.tx.toLocaleString()}</td>
              <td>{block.value}</td>
              <td>{block.difficulty}</td>
              <td className="text-primary">{block.minedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRichList({ t }: { t: (key: string) => string }) {
  const { data: richList, isLoading, error } = useBlockchainRichList(''); // Empty string for now since we don't have blockchain-specific rich list data
  
  if (isLoading) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.rank")}</th>
              <th>{t("blockchain.address")}</th>
              <th>{t("blockchain.amount")}</th>
              <th>{t("blockchain.percent")}</th>
              <th>{t("blockchain.last_change")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={5}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.loading_data")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  if (error || !richList || richList.length === 0) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.rank")}</th>
              <th>{t("blockchain.address")}</th>
              <th>{t("blockchain.amount")}</th>
              <th>{t("blockchain.percent")}</th>
              <th>{t("blockchain.last_change")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={5}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.no_data_available")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">{t("blockchain.rank")}</th>
            <th>{t("blockchain.address")}</th>
            <th>{t("blockchain.amount")}</th>
            <th>{t("blockchain.percent")}</th>
            <th>{t("blockchain.last_change")}</th>
          </tr>
        </thead>
        <tbody>
          {richList.map((entry, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{entry.rank}</td>
              <td className="text-primary">{entry.address}</td>
              <td>{entry.amount}</td>
              <td>{entry.pct}</td>
              <td>{entry.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableOverview({ t }: { t: (key: string) => string }) {
  const { data: overview, isLoading, error } = useBlockchainOverview(''); // Empty string for now
  
  if (isLoading) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.date_time")}</th>
              <th>{t("blockchain.blocks")}</th>
              <th>{t("blockchain.height")}</th>
              <th>{t("blockchain.interval")}</th>
              <th>{t("blockchain.transactions")}</th>
              <th>{t("blockchain.value_out")}</th>
              <th>{t("blockchain.difficulty_column")}</th>
              <th>{t("blockchain.generated")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={8}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.loading_data")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  if (error || !overview || overview.length === 0) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.date_time")}</th>
              <th>{t("blockchain.blocks")}</th>
              <th>{t("blockchain.height")}</th>
              <th>{t("blockchain.interval")}</th>
              <th>{t("blockchain.transactions")}</th>
              <th>{t("blockchain.value_out")}</th>
              <th>{t("blockchain.difficulty_column")}</th>
              <th>{t("blockchain.generated")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={8}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.no_data_available")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">{t("blockchain.date_time")}</th>
            <th>{t("blockchain.blocks")}</th>
            <th>{t("blockchain.height")}</th>
            <th>{t("blockchain.interval")}</th>
            <th>{t("blockchain.transactions")}</th>
            <th>{t("blockchain.value_out")}</th>
            <th>{t("blockchain.difficulty_column")}</th>
            <th>{t("blockchain.generated")}</th>
          </tr>
        </thead>
        <tbody>
          {overview.map((row, i) => (
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

function TableExtraction({ t }: { t: (key: string) => string }) {
  const { data: extraction, isLoading, error } = useBlockchainExtraction(''); // Empty string for now
  
  if (isLoading) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.rank")}</th>
              <th>{t("blockchain.pool_miner")}</th>
              <th>{t("blockchain.last_100")}</th>
              <th>{t("blockchain.last_1000")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={4}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.loading_data")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  if (error || !extraction || extraction.length === 0) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.rank")}</th>
              <th>{t("blockchain.pool_miner")}</th>
              <th>{t("blockchain.last_100")}</th>
              <th>{t("blockchain.last_1000")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={4}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.no_data_available")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">{t("blockchain.rank")}</th>
            <th>{t("blockchain.pool_miner")}</th>
            <th>{t("blockchain.last_100")}</th>
            <th>{t("blockchain.last_1000")}</th>
          </tr>
        </thead>
        <tbody>
          {extraction.map((row, i) => (
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

function TableNetwork({ t }: { t: (key: string) => string }) {
  const { data: network, isLoading, error } = useBlockchainNetwork(''); // Empty string for now
  
  if (isLoading) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.rank")}</th>
              <th>{t("blockchain.client")}</th>
              <th>{t("blockchain.node_count")}</th>
              <th>{t("blockchain.share")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={4}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.loading_data")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  if (error || !network || network.length === 0) {
    return (
      <div className="overflow-x-auto mb-16">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2">{t("blockchain.rank")}</th>
              <th>{t("blockchain.client")}</th>
              <th>{t("blockchain.node_count")}</th>
              <th>{t("blockchain.share")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2" colSpan={4}>
                <div className="text-center py-4 text-muted-foreground">
                  {t("blockchain.no_data_available")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="py-2">{t("blockchain.rank")}</th>
            <th>{t("blockchain.client")}</th>
            <th>{t("blockchain.node_count")}</th>
            <th>{t("blockchain.share")}</th>
          </tr>
        </thead>
        <tbody>
          {network.map((row, i) => (
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

function TableMarket({ t }: { t: (key: string) => string }) {
  const { data: market, isLoading, error } = useBlockchainMarket(''); // Empty string for now
  
  if (isLoading) {
    return (
      <div className="mb-16">
        <div className="bg-muted/30 rounded-lg border overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b">
            <h3 className="font-semibold">{t("blockchain.markets")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="text-left p-3">{t("blockchain.exchange")}</th>
                  <th className="text-left p-3">{t("blockchain.markets")}</th>
                  <th className="text-right p-3">{t("blockchain.usd_price")}</th>
                  <th className="text-right p-3">{t("blockchain.volume_24h")}</th>
                  <th className="text-right p-3">{t("blockchain.share")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-muted/50">
                  <td className="p-3" colSpan={5}>
                    <div className="text-center py-4 text-muted-foreground">
                      {t("blockchain.loading_data")}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !market || market.length === 0) {
    return (
      <div className="mb-16">
        <div className="bg-muted/30 rounded-lg border overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b">
            <h3 className="font-semibold">{t("blockchain.markets")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="text-left p-3">{t("blockchain.exchange")}</th>
                  <th className="text-left p-3">{t("blockchain.markets")}</th>
                  <th className="text-right p-3">{t("blockchain.usd_price")}</th>
                  <th className="text-right p-3">{t("blockchain.volume_24h")}</th>
                  <th className="text-right p-3">{t("blockchain.share")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-muted/50">
                  <td className="p-3" colSpan={5}>
                    <div className="text-center py-4 text-muted-foreground">
                      {t("blockchain.no_data_available")}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-16">
      <div className="bg-muted/30 rounded-lg border overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b">
          <h3 className="font-semibold">{t("blockchain.markets")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="text-left p-3">{t("blockchain.exchange")}</th>
                <th className="text-left p-3">{t("blockchain.markets")}</th>
                <th className="text-right p-3">{t("blockchain.usd_price")}</th>
                <th className="text-right p-3">{t("blockchain.volume_24h")}</th>
                <th className="text-right p-3">{t("blockchain.share")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {market.map((entry, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-muted mr-2 flex items-center justify-center text-xs">
                        {entry.exchange[0]}
                      </div>
                      {entry.exchange}
                    </div>
                  </td>
                  <td className="p-3">{entry.pair}</td>
                  <td className="p-3 text-right font-medium">{entry.price}</td>
                  <td className="p-3 text-right">{entry.volume}</td>
                  <td className="p-3 text-right">{entry.share}</td>
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

function TableAbout({ t }: { t: (key: string) => string }) {
  // In a real implementation, this would come from the blockchain detail data
  const blockchainInfo = {
    name: "Bitcoin",
    symbol: "BTC",
    algorithm: "SHA-256",
    firstBlock: "2009-01-03",
    website: "https://bitcoin.org"
  };
  
  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Information Table */}
        <div className="flex-1">
          <div className="bg-muted/30 rounded-lg border overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b">
              <h3 className="font-semibold">{t("blockchain.information")}</h3>
            </div>
            <div className="divide-y">
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">{t("blockchain.name_tag")}</div>
                <div className="w-2/3 font-medium">{blockchainInfo.name} ({blockchainInfo.symbol})</div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">{t("blockchain.algorithm")}</div>
                <div className="w-2/3">{blockchainInfo.algorithm}</div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">{t("blockchain.wallet_version")}</div>
                <div className="w-2/3">0.21.1</div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">{t("blockchain.social_nets")}</div>
                <div className="w-2/3 flex gap-2">
                  <a href={blockchainInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {t("blockchain.visit_website")}
                  </a>
                  <a href="https://twitter.com/bitcoin" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Twitter
                  </a>
                  <a href="https://github.com/bitcoin" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    GitHub
                  </a>
                </div>
              </div>
              <div className="flex p-4">
                <div className="w-1/3 text-muted-foreground">{t("blockchain.first_block")}</div>
                <div className="w-2/3">{blockchainInfo.firstBlock}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className="w-full md:w-64">
          <div className="bg-muted/30 rounded-lg border overflow-hidden h-full">
            <div className="bg-muted px-4 py-2 border-b">
              <h3 className="font-semibold">{t("blockchain.logo")}</h3>
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

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void; }) {
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


