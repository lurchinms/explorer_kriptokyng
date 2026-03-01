// app/blockchains/[id]/blocks/[height]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlockDetailsClient from "./client";

// --- MOCK DATA ---
const getBlockDetails = (height: number) => {
  const blocks = {
    926844: {
      hash: "00000000000000000006bb01c4818cfb7154e95e88b01e55e3f1251b7501d",
      timestamp: "2025-12-07 20:57:28",
      transactions: 5075,
      size: "1.58 MB",
      weight: "3.99 MWU",
      version: "0x2000c000",
      nonce: "312099509",
      bits: "1709a696",
      difficulty: "149.3012055959700",
      merkle_root: "528c4e2dc909b8…",
      previous_block: "00000000000000000006bb01c4818cfae955f31b…",
      next_block: "0000000000000000000ccdb01c481999d52fa045…",
      reward: "3.13874683 BTC",
      fees: "0.0000 BTC",
      miner: "bc1qvzrqryq3ja8w7h…pqwd7k38",
      confirmations: 1,
      tx: [
        {
          hash: "56eca95b00ff3b13c54ef48a7f35ddc121bfd6dad978141687dfc8393d0187a52",
          input: "Generation + Fees",
          output: "3.13874683 BTC",
        },
        {
          hash: "fa9442ae7572…",
          input: "bc1q0kptdtn5v1d…",
          output: "0.030857 BTC",
        },
      ],
    },
  };

  return blocks[height as keyof typeof blocks] || null;
};

export default async function BlockDetailsPage({
  params,
}: {
  params: Promise<{ id: string; height: string }>;
}) {
  const resolvedParams = await params;
  const block = getBlockDetails(Number(resolvedParams.height));

  if (!block) return notFound();

  return <BlockDetailsClient block={block} params={resolvedParams} />;
}