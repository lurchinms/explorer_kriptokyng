// Updated PoolBlocks component without fallback text values
"use client";

import { usePoolBlocks, usePool } from "@/lib/hooks/use-miningcore";
import { formatNumber, formatRelativeTime } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Loader2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useCryptoPrice } from "@/lib/hooks/use-crypto-price";
import { BlockStatus } from "@/components/ui/block-status";
import { useLanguage } from "@/contexts/language-context";

interface PoolBlocksProps {
  poolId: string;
  symbol?: string;
}

export function PoolBlocks({ poolId, symbol }: PoolBlocksProps) {
  const { t } = useLanguage();
  const { data: blocks, isLoading, isError } = usePoolBlocks(poolId);
  const { data: poolData } = usePool(poolId);
  const { data: priceData } = useCryptoPrice(symbol || "", poolId);
  const hasPriceData = priceData && priceData.price !== null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("poolBlocks.recentBlocks")}</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !blocks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("poolBlocks.recentBlocks")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            {t("poolBlocks.failedToLoad")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultBlockReward = poolData?.blockReward || 0;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>{t("poolBlocks.recentBlocks")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("poolBlocks.height")}</TableHead>
                  <TableHead>{t("poolBlocks.time")}</TableHead>
                  <TableHead>{t("poolBlocks.status")}</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      {t("poolBlocks.blockFinder")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1 text-xs">
                            <p><strong>PPLNS:</strong> {t("poolBlocks.tooltip.pplns")}</p>
                            <p><strong>PROP:</strong> {t("poolBlocks.tooltip.prop")}</p>
                            <p><strong>SOLO:</strong> {t("poolBlocks.tooltip.solo")}</p>
                            <p><strong>PPS:</strong> {t("poolBlocks.tooltip.pps")}</p>
                            <p><strong>PPBS:</strong> {t("poolBlocks.tooltip.ppbs")}</p>
                            <p><strong>PPLNSBF:</strong> {t("poolBlocks.tooltip.pplnsbf")}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>{t("poolBlocks.effort")}</TableHead>
                  <TableHead>{t("poolBlocks.reward")}</TableHead>
                  <TableHead className="text-right">{t("poolBlocks.actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {blocks.map((block) => (
                  <TableRow key={block.hash}>
                    <TableCell className="font-medium">{formatNumber(block.blockHeight)}</TableCell>
                    <TableCell>{formatRelativeTime(block.created)}</TableCell>

                    <TableCell>
                      <BlockStatus
                        poolId={poolId}
                        blockHeight={block.blockHeight}
                        status={block.status}
                        confirmationProgress={block.confirmationProgress}
                      />
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {poolData?.paymentProcessing?.payoutScheme === "PPLNS" ||
                      poolData?.paymentProcessing?.payoutScheme === "PPLNSBF" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">
                            {poolData?.paymentProcessing?.payoutScheme === "PPLNSBF"
                              ? t("poolBlocks.sharedBlockBonus")
                              : t("poolBlocks.sharedBlock")}
                          </span>

                          <span className="text-xs text-muted-foreground" title={`Found by: ${block.miner}`}>
                            {poolData?.paymentProcessing?.payoutScheme === "PPLNSBF"
                              ? t("poolBlocks.multipleContributorsBonus")
                              : t("poolBlocks.multipleContributors")}
                          </span>
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      <Badge variant={block.effort < 1 ? "success" : block.effort < 2 ? "outline" : "destructive"}>
                        {(block.effort * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {block.reward > 0 ? (
                        <div>
                          {formatNumber(block.reward, 8)} {symbol}
                          {hasPriceData && (
                            <span className="text-green-500 text-xs ml-1">
                              (≈${formatNumber(block.reward * (priceData?.price || 0), 2)})
                            </span>
                          )}
                        </div>
                      ) : (
                        t("poolBlocks.pending")
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {block.infoLink && (
                        <Link
                          href={block.infoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
