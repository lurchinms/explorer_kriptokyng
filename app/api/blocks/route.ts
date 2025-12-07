import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const response = await fetch("https://api.kriptokyng.com/api/blocks", {
      headers: {
        "Cache-Control": "no-cache",
      },
      next: {
        revalidate: 30, // Cache for 30 seconds
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blocks: Block[] = await response.json();

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocks data" },
      { status: 500 }
    );
  }
}
