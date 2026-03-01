'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface BlockDetailsClientProps {
  block: any;
  params: { id: string; height: string };
}

export default function BlockDetailsClient({ block, params }: BlockDetailsClientProps) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Back */}
      <div className="mb-6">
        <Link
          href={`/blockchains/${params.id}`}
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("blockchain.back_to_blockchain")}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{t("blockchain.block")} #{params.height}</h1>
      <p className="text-muted-foreground">
        Mined on {block.timestamp} • {block.confirmations} confirmations
      </p>

      {/* Block Details Box */}
      <div className="bg-gray-900 text-white rounded-lg border border-gray-700 p-6 mt-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">{t("blockchain.block_details")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">{t("blockchain.hash")}:</p>
            <p className="font-mono text-sm break-all">{block.hash}</p>

            <p className="text-muted-foreground mt-3">{t("blockchain.previous_block")}:</p>
            <Link
              href={`/blockchains/${params.id}/blocks/${
                Number(params.height) - 1
              }`}
              className="font-mono text-sm text-primary break-all"
            >
              {block.previous_block}
            </Link>

            <p className="text-muted-foreground mt-3">{t("blockchain.next_block")}:</p>
            <Link
              href={`/blockchains/${params.id}/blocks/${
                Number(params.height) + 1
              }`}
              className="font-mono text-sm text-primary break-all"
            >
              {block.next_block}
            </Link>

            <p className="text-muted-foreground mt-3">{t("blockchain.merkle_root")}:</p>
            <p className="font-mono text-sm">{block.merkle_root}</p>
          </div>

          <div>
            <p className="text-muted-foreground">{t("blockchain.transactions")}:</p>
            <p>{block.transactions.toLocaleString()}</p>

            <p className="text-muted-foreground mt-3">{t("blockchain.size")}:</p>
            <p>{block.size}</p>

            <p className="text-muted-foreground mt-3">{t("blockchain.weight")}:</p>
            <p>{block.weight}</p>

            <p className="text-muted-foreground mt-3">{t("blockchain.difficulty")}:</p>
            <p>{block.difficulty}</p>

            <p className="text-muted-foreground mt-3">{t("blockchain.block_reward")}:</p>
            <p>{block.reward}</p>

            <p className="text-muted-foreground mt-3">{t("blockchain.fees")}:</p>
            <p>{block.fees}</p>

            <p className="text-muted-foreground mt-3">{t("blockchain.miner")}:</p>
            <p className="text-primary">{block.miner}</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-xl font-semibold mb-4">
        {t("blockchain.transactions")} ({block.tx.length})
      </h2>

      <div className="bg-muted/30 rounded-lg border divide-y">
        {block.tx.map((t: any) => (
          <Link
            key={t.hash}
            href={`/blockchains/${params.id}/tx/${t.hash}`}
            className="p-4 flex justify-between hover:bg-muted transition"
          >
            <span className="font-mono text-primary">{t.hash}</span>
            <span>{t.output}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
