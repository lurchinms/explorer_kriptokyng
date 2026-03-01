import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface TableLatestBlocksProps {
  blockchainId: string;
  t: (key: string) => string;
  blocks?: any[];
}

export function TableLatestBlocks({ blockchainId, t, blocks = [] }: TableLatestBlocksProps) {
  if (!blocks || blocks.length === 0) {
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
          {blocks.map((block: any, i) => (
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
