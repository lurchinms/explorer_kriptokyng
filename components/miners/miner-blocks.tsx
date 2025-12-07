"use client";

import { useMinerBlocks, useMinerContributedBlocks, usePool } from "@/lib/hooks/use-miningcore";
import { formatNumber, formatRelativeTime } from "@/lib/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCryptoPrice } from "@/lib/hooks/use-crypto-price";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BlockStatus } from "@/components/ui/block-status";
import { useLanguage } from "@/contexts/language-context"; // Added import

interface MinerBlocksProps {
  poolId: string;
  address: string;
  coinSymbol: string;
}

export function MinerBlocks({ poolId, address, coinSymbol }: MinerBlocksProps) {
  const { t } = useLanguage(); // Added language hook
  
  // Fetch pool data to get the payout scheme
  const { data: poolData } = usePool(poolId);
  
  // Determine which hook to use based on payout scheme
  const isSharedMining = poolData?.paymentProcessing?.payoutScheme && 
    !["SOLO"].includes(poolData.paymentProcessing.payoutScheme);
  
  // Fetch contributed blocks for shared mining, or found blocks for solo mining
  const { 
    data: contributedBlocks = [], 
    isLoading: isLoadingContributed, 
    isError: isErrorContributed 
  } = useMinerContributedBlocks(
    isSharedMining ? poolId : null, 
    isSharedMining ? address : null
  );
  
  // Fetch blocks found by miner (always for solo, backup for shared)
  const { 
    data: foundBlocks = [], 
    isLoading: isLoadingFound, 
    isError: isErrorFound 
  } = useMinerBlocks(poolId, address);
  
  // Use contributed blocks for shared mining, found blocks for solo
  const blocks = isSharedMining ? contributedBlocks : foundBlocks;
  const isLoading = isSharedMining ? isLoadingContributed : isLoadingFound;
  const isError = isSharedMining ? isErrorContributed : isErrorFound;
  
  // Fetch crypto price data
  const { data: priceData } = useCryptoPrice(coinSymbol, poolId);
  const hasPriceData = priceData && priceData.price !== null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("minerBlocks.title")}</CardTitle>
          <CardDescription>{t("minerBlocks.loading")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError || blocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("minerBlocks.title")}</CardTitle>
          <CardDescription>{t("minerBlocks.noBlocks")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[100px] flex flex-col items-center justify-center">
            <p className="text-muted-foreground">{t("minerBlocks.noBlocksFound")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the default block reward from pool data
  const defaultBlockReward = poolData?.blockReward || 0;

  // Count blocks by status - handle both block types
  const confirmedBlocks = blocks.filter((block: any) => block.status === "confirmed").length;
  const pendingBlocks = blocks.filter((block: any) => block.status === "pending").length;
  const orphanedBlocks = blocks.filter((block: any) => block.status === "orphaned").length;
  
  // Calculate total rewards
  const totalRewards = blocks
    .filter((block: any) => block.status === "confirmed")
    .reduce((sum: number, block: any) => sum + (parseFloat(block.reward) || 0), 0);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>{isSharedMining ? t("minerBlocks.contributedBlocks") : t("minerBlocks.blocksFound")}</CardTitle>
          <CardDescription>
            {blocks.length} {t("minerBlocks.blocks")} ({confirmedBlocks} {t("minerBlocks.confirmed")}, {pendingBlocks} {t("minerBlocks.immature")}, {orphanedBlocks} {t("minerBlocks.orphaned")})
            {isSharedMining && (
              <span className="block mt-1 text-xs">
                {t("minerBlocks.contributionDescription")}
                <br />
                <span className="text-orange-600">{t("minerBlocks.contributionExplanation")}</span>
              </span>
            )}
            {confirmedBlocks > 0 && totalRewards > 0 && (
              <>
                {" - " + t("minerBlocks.totalRewards") + ": "}
                {formatNumber(totalRewards, 8)} {coinSymbol}
                {hasPriceData && (
                  <span className="text-green-500">
                    {" (≈$" + formatNumber(totalRewards * (priceData?.price || 0), 2) + ")"}
                  </span>
                )}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("minerBlocks.height")}</TableHead>
                  <TableHead>{t("minerBlocks.time")}</TableHead>
                  <TableHead>{t("minerBlocks.status")}</TableHead>
                  {isSharedMining && <TableHead>{t("minerBlocks.contribution")}</TableHead>}
                  <TableHead>{t("minerBlocks.effort")}</TableHead>
                  <TableHead>{t("minerBlocks.reward")}</TableHead>
                  <TableHead className="text-right">{t("minerBlocks.details")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block: any) => (
                  <TableRow key={block.hash}>
                    <TableCell className="font-medium">
                      {formatNumber(parseInt(block.blockHeight) || 0, 0)}
                    </TableCell>
                    <TableCell>{formatRelativeTime(block.created)}</TableCell>
                    <TableCell>
                      <BlockStatus 
                        poolId={poolId}
                        blockHeight={parseInt(block.blockHeight) || 0}
                        status={block.status}
                        confirmationProgress={block.confirmationprogress}
                      />
                    </TableCell>
                    {isSharedMining && (
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {/* Show payout scheme with color coding */}
                          {poolData?.paymentProcessing?.payoutScheme === "PPLNS" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-blue-600 border-blue-600 cursor-help">
                                  PPLNS
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("minerBlocks.payoutSchemes.pplns")}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : poolData?.paymentProcessing?.payoutScheme === "PPLNSBF" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-blue-600 border-blue-600 cursor-help">
                                  PPLNSBF
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("minerBlocks.payoutSchemes.pplnsbf")}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : poolData?.paymentProcessing?.payoutScheme === "PROP" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-purple-600 border-purple-600 cursor-help">
                                  PROP
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("minerBlocks.payoutSchemes.prop")}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : poolData?.paymentProcessing?.payoutScheme === "PPS" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-orange-600 border-orange-600 cursor-help">
                                  PPS
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("minerBlocks.payoutSchemes.pps")}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : poolData?.paymentProcessing?.payoutScheme === "PPBS" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-teal-600 border-teal-600 cursor-help">
                                  PPBS
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("minerBlocks.payoutSchemes.ppbs")}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 border-gray-600">
                              {poolData?.paymentProcessing?.payoutScheme || t("common.unknown")}
                            </Badge>
                          )}
                          
                          {/* Show contribution percentage and finder status */}
                          <div className="text-xs space-y-1">
                            {block.isFounder ? (
                              <div className="flex items-center gap-1">
                                <span className="text-green-600 font-medium">⭐ {t("minerBlocks.finder")}</span>
                                {block.minerContribution > 0 && (
                                  <span className="text-muted-foreground">
                                    ({block.minerContribution.toFixed(1)}%)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                {t("minerBlocks.contributor")}: {block.minerContribution > 0 ? 
                                  `${block.minerContribution.toFixed(1)}%` : 
                                  t("common.na")
                                }
                              </div>
                            )}
                            
                            {parseInt(block.minerShares) > 0 && parseInt(block.totalShares) > 0 ? (
                              <div className="text-xs text-muted-foreground">
                                {block.minerShares}/{block.totalShares} {t("minerBlocks.shares")}
                                {block.minerContribution >= 100 && (
                                  <span className="text-orange-600 ml-1">({t("minerBlocks.soloPeriod")})</span>
                                )}
                              </div>
                            ) : block.minerContribution > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {t("minerBlocks.contribution")}: {block.minerContribution.toFixed(1)}%
                                {block.minerContribution >= 100 && (
                                  <span className="text-orange-600 ml-1">({t("minerBlocks.soloPeriod")})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={
                          !block.effort || block.effort < 1 
                            ? "success"
                            : block.effort < 2
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {block.effort ? 
                          `${(parseFloat(block.effort) * 100).toFixed(1)}%` : 
                          t("common.na")
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {parseFloat(block.reward) > 0 ? (
                        <div>
                          {isSharedMining && block.minerContribution > 0 && block.minerContribution < 100 ? (
                            <div>
                              <div>
                                {formatNumber(parseFloat(block.reward) * (block.minerContribution / 100), 8)} {coinSymbol}
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({t("minerBlocks.yourShare")} {block.minerContribution.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t("minerBlocks.total")}: {formatNumber(parseFloat(block.reward), 8)} {coinSymbol}
                              </div>
                            </div>
                          ) : (
                            <div>
                              {formatNumber(parseFloat(block.reward), 8)} {coinSymbol}
                              {isSharedMining && block.minerContribution >= 100 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (100% - {t("minerBlocks.solo")})
                                </span>
                              )}
                              {hasPriceData && (
                                <span className="text-green-500 text-xs ml-1">
                                  (≈${formatNumber(parseFloat(block.reward) * (priceData?.price || 0), 2)})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : block.status === "pending" && defaultBlockReward > 0 ? (
                        <div>
                          <span className="flex items-center">
                            <span className="text-muted-foreground">~</span>
                            {isSharedMining && block.minerContribution > 0 ? (
                              <span>
                                {formatNumber(defaultBlockReward * (block.minerContribution / 100), 8)} {coinSymbol}
                                <span className="text-xs text-muted-foreground ml-1">({t("minerBlocks.estimatedShare")})</span>
                              </span>
                            ) : (
                              <span>{formatNumber(defaultBlockReward, 8)} {coinSymbol}</span>
                            )}
                          </span>
                          {hasPriceData && (
                            <span className="text-green-500 text-xs ml-1">
                              (≈${formatNumber(defaultBlockReward * (priceData?.price || 0), 2)})
                            </span>
                          )}
                        </div>
                      ) : (
                        t("minerBlocks.pending")
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {block.infoLink && (
                        <Link
                          href={
                            // Use block height for Tenzura pools instead of hash
                            poolId.startsWith('tenz') 
                              ? `https://chain.tenzura.io/block/${block.blockHeight}`
                              : block.infoLink
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">{t("minerBlocks.viewDetails")}</span>
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