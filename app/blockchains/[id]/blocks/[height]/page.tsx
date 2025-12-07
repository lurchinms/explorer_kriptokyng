// app/blockchains/[id]/blocks/[height]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  params: { id: string; height: string };
}) {
  const block = getBlockDetails(Number(params.height));

  if (!block) return notFound();

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Back */}
      <div className="mb-6">
        <Link
          href={`/blockchains/${params.id}`}
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blockchain
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Block #{params.height}</h1>
      <p className="text-muted-foreground">
        Mined on {block.timestamp} • {block.confirmations} confirmations
      </p>

      {/* Block Details Box */}
<div className="bg-gray-900 text-white rounded-lg border border-gray-700 p-6 mt-6 mb-10">        <h2 className="text-xl font-semibold mb-4">Block Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Hash:</p>
            <p className="font-mono text-sm break-all">{block.hash}</p>

            <p className="text-muted-foreground mt-3">Previous Block:</p>
            <Link
              href={`/blockchains/${params.id}/blocks/${
                Number(params.height) - 1
              }`}
              className="font-mono text-sm text-primary break-all"
            >
              {block.previous_block}
            </Link>

            <p className="text-muted-foreground mt-3">Next Block:</p>
            <Link
              href={`/blockchains/${params.id}/blocks/${
                Number(params.height) + 1
              }`}
              className="font-mono text-sm text-primary break-all"
            >
              {block.next_block}
            </Link>

            <p className="text-muted-foreground mt-3">Merkle Root:</p>
            <p className="font-mono text-sm">{block.merkle_root}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Transactions:</p>
            <p>{block.transactions.toLocaleString()}</p>

            <p className="text-muted-foreground mt-3">Size:</p>
            <p>{block.size}</p>

            <p className="text-muted-foreground mt-3">Weight:</p>
            <p>{block.weight}</p>

            <p className="text-muted-foreground mt-3">Difficulty:</p>
            <p>{block.difficulty}</p>

            <p className="text-muted-foreground mt-3">Block Reward:</p>
            <p>{block.reward}</p>

            <p className="text-muted-foreground mt-3">Fees:</p>
            <p>{block.fees}</p>

            <p className="text-muted-foreground mt-3">Miner:</p>
            <p className="text-primary">{block.miner}</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-xl font-semibold mb-4">
        Transactions ({block.tx.length})
      </h2>

      <div className="bg-muted/30 rounded-lg border divide-y">
        {block.tx.map((t) => (
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