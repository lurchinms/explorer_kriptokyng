import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const getTxDetails = (txid: string) => {
  const tx = {
    "56eca95b00ff3b13c54ef48a7f35ddc121bfd6dad978141687dfc8393d0187a52": {
      block_height: 926849,
      time: "2025-12-07 20:57:28",
      inputs: [
        {
          address: "Generation + Fees",
          amount: "3.13874683 BTC",
        },
      ],
      outputs: [
        {
          address: "bc1qvzrqryq3ja8w7hnja2spmk9fdcgqwps5wz4afang5jecf2w0pqwd7k38",
          amount: "3.13874683 BTC",
        },
        { address: "OP_RETURN", amount: "0 BTC" },
      ],
    },
  };

  return tx[txid as keyof typeof tx] || null;
};

export default function TxPage({
  params,
}: {
  params: { id: string; txid: string };
}) {
  const tx = getTxDetails(params.txid);

  if (!tx)
    return (
      <div className="p-10">Transaction not found: {params.txid}</div>
    );

  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        href={`/blockchains/${params.id}/blocks/${tx.block_height}`}
        className="inline-flex items-center text-primary hover:underline mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Block
      </Link>

      <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>

      <div className="bg-muted/30 border p-6 rounded-lg mb-6">
        <p className="text-muted-foreground">Hash:</p>
        <p className="font-mono break-all mb-4">{params.txid}</p>

        <p className="text-muted-foreground">Included in Block:</p>
        <Link
          href={`/blockchains/${params.id}/blocks/${tx.block_height}`}
          className="text-primary font-mono"
        >
          {tx.block_height}
        </Link>
      </div>

      {/* Inputs */}
      <h2 className="font-semibold text-xl mb-3">Inputs</h2>
      <div className="border rounded-lg bg-muted/30 divide-y">
        {tx.inputs.map((input, i) => (
          <div key={i} className="p-4 flex justify-between">
            <span className="font-mono">{input.address}</span>
            <span>{input.amount}</span>
          </div>
        ))}
      </div>

      {/* Outputs */}
      <h2 className="font-semibold text-xl mt-6 mb-3">Outputs</h2>
      <div className="border rounded-lg bg-muted/30 divide-y">
        {tx.outputs.map((output, i) => (
          <div key={i} className="p-4 flex justify-between">
            <span className="font-mono">{output.address}</span>
            <span>{output.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
