
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, ExternalLink, Server, Database, Coins, BarChart3, Users, Wifi, WifiOff } from "lucide-react";
import { Pool } from "@/lib/types/miningcore";
import { stratumConfig } from "@/config/Stratum";
import { formatHashrate, formatNumber, formatDifficulty, formatRelativeTime, formatRawNumber } from "@/lib/utils/format";
import { CoinIcon } from "@/components/ui/coin-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PoolPerformance } from "@/components/pools/pool-performance";
import { PoolBlocks } from "@/components/pools/pool-blocks";
import { useCryptoPrice } from "@/lib/hooks/use-crypto-price";
import { useLanguage } from "@/contexts/language-context";

interface PoolDetailsProps {
  pool: Pool;
  wsConnected?: boolean;
}

export function PoolDetails({ pool, wsConnected = false }: PoolDetailsProps) {
  const { t } = useLanguage();

  // Add price data hook
  const { data: priceData } = useCryptoPrice(pool.coin.symbol, pool.id);
  const hasPriceData = priceData && priceData.price !== null;

  // Calculate total confirmed blocks (total blocks minus pending blocks)
  const totalConfirmedBlocks = pool.totalConfirmedBlocks ?? (pool.totalBlocks - (pool.totalPendingBlocks || 0));
  const totalPendingBlocks = pool.totalPendingBlocks || 0;

  // Calculate total confirmed block rewards
  const totalConfirmedRewards = pool.blockReward * totalConfirmedBlocks;

  // Calculate USD value if price data is available
  const totalRewardsUsd = hasPriceData
    ? totalConfirmedRewards * (priceData?.price ?? 0)
    : null;

  // Function to get flag image URL based on country code
  const getFlagImageUrl = (code: string): string => {
    // Handle special cases
    if (code.toLowerCase() === 'global') {
      // Use a generic globe icon for global servers
      return 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/un.svg'; // UN flag for global
    }

    // Use the country code directly for flag-icons
    return `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${code.toLowerCase()}.svg`;
  };

  // Function to measure ping to a server
  const [serverPings, setServerPings] = useState<{ [key: string]: number | null | 'offline' }>({});

  useEffect(() => {
    const measurePing = async (host: string, key: string) => {
      const pingAttempts: number[] = [];
      const maxAttempts = 3;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const startTime = performance.now();
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(`https://${host}`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });

          clearTimeout(timeout);
          const endTime = performance.now();

          if (response.ok) {
            try {
              const data = await response.json();
              // Check if the response indicates stratum or load balancer is alive
              if (data.status === 'ok' && (data.message === 'Stratum is alive' || data.message === 'Load Balancer is alive')) {
                const latency = Math.round(endTime - startTime);
                pingAttempts.push(latency);

                // Small delay between attempts to avoid overwhelming the server
                if (attempt < maxAttempts - 1) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              } else {
                // Server responded but not with expected stratum response
                setServerPings(prev => ({ ...prev, [key]: 'offline' }));
                return;
              }
            } catch (jsonError) {
              // Response wasn't JSON or wasn't the expected format
              setServerPings(prev => ({ ...prev, [key]: 'offline' }));
              return;
            }
          } else {
            // HTTP error response
            setServerPings(prev => ({ ...prev, [key]: 'offline' }));
            return;
          }
        } catch (error) {
          // Network error, timeout, or other failure - continue to next attempt
          if (attempt === maxAttempts - 1) {
            setServerPings(prev => ({ ...prev, [key]: 'offline' }));
            return;
          }
        }
      }

      // If we have successful ping attempts, calculate average (removing outliers if we have enough data)
      if (pingAttempts.length > 0) {
        let finalPing: number;
        if (pingAttempts.length >= 3) {
          // Remove highest and lowest values, average the rest
          pingAttempts.sort((a, b) => a - b);
          const middle = pingAttempts.slice(1, -1);
          finalPing = Math.round(middle.reduce((sum, val) => sum + val, 0) / middle.length);
        } else {
          // Not enough data points, just average what we have
          finalPing = Math.round(pingAttempts.reduce((sum, val) => sum + val, 0) / pingAttempts.length);
        }
        setServerPings(prev => ({ ...prev, [key]: finalPing }));
      } else {
        setServerPings(prev => ({ ...prev, [key]: 'offline' }));
      }
    };

    const measureAllPings = () => {
      if (pool.stratumServers) {
        Object.entries(pool.stratumServers).forEach(([key, server]) => {
          measurePing(server.host, key);
        });
      }
    };

    // Initial measurement
    measureAllPings();

    // Set up interval for re-measurement every 30 seconds
    const interval = setInterval(measureAllPings, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [pool.stratumServers]);

  return (
    <div className="container py-8 px-4">
      {/* Back Button */}
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/pools" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.backToPools')}
          </Link>
        </Button>

        <Badge variant={wsConnected ? "default" : "secondary"} className="flex items-center gap-1">
          {wsConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              {t('common.live')}
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              {t('common.offline')}
            </>
          )}
        </Badge>
      </div>

      {/* Pool Header */}
      <div className="flex flex-col items-center gap-4 mb-8 w-full">
        <div className="flex flex-col items-center gap-3">
          <CoinIcon symbol={pool.coin.symbol} name={pool.coin.name} size={48} className="min-w-[48px]" />
          <h1 className="text-3xl font-bold">{pool.coin.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{pool.coin.algorithm}</Badge>
            <Badge>{pool.coin.symbol}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center w-full">
          {/* Add Performance Link */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pools/${pool.id}/performance`} className="flex items-center">
              <BarChart3 className="mr-1 h-4 w-4" />
              {t('pool.performance')}
            </Link>
          </Button>

          {/* Add Blocks Link */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pools/${pool.id}/blocks`} className="flex items-center">
              <Database className="mr-1 h-4 w-4" />
              {t('pool.blocks')}
            </Link>
          </Button>

          {/* Add Payments Link */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pools/${pool.id}/payments`} className="flex items-center">
              <Coins className="mr-1 h-4 w-4" />
              {t('pool.payments')}
            </Link>
          </Button>

          {/* Add Miners Link */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pools/${pool.id}/miners`} className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {t('pool.miners')}
            </Link>
          </Button>

          {pool.coin.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={pool.coin.website} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Globe className="mr-1 h-4 w-4" />
                {t('common.website')}
              </a>
            </Button>
          )}
          {pool.coin.market && (
            <Button variant="outline" size="sm" asChild>
              <a href={pool.coin.market} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <BarChart3 className="mr-1 h-4 w-4" />
                {t('common.market')}
              </a>
            </Button>
          )}
          {pool.addressInfoLink && (
            <Button variant="outline" size="sm" asChild>
              <a href={pool.addressInfoLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <ExternalLink className="mr-1 h-4 w-4" />
                {t('common.explorer')}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full items-stretch">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="mr-2 h-4 w-4 text-primary" /> {t('pool.poolHashrate')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <p className="text-2xl font-bold">{formatHashrate(pool.poolStats?.poolHashrate || 0)}</p>
           <p className="text-sm text-muted-foreground mt-1">
  {t('pool.connectedMiners', { count: pool?.poolStats?.connectedMiners || 0 })}
</p>

            <Button
              variant="link"
              className="px-0 mt-2"
              asChild
            >
              <Link href={`/pools/${pool.id}/performance`}>
                {t('pool.viewPerformanceHistory')} →
              </Link>
            </Button>
          </CardContent>
        </Card>
        {/* Modified Blocks Found card */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Database className="mr-2 h-4 w-4 text-primary" /> {t('pool.blocksFound')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-bold">{formatNumber(pool.totalBlocks, 0)}</p>

              {/* Show confirmed vs pending breakdown */}
              <div className="mt-1 text-sm">
                <div className="flex items-center gap-4">
                  <span>
                    <span className="text-green-600">✓ {formatNumber(totalConfirmedBlocks, 0)}</span>
                    <span className="text-muted-foreground ml-1">{t('pool.confirmed')}</span>
                  </span>
                  {totalPendingBlocks > 0 && (
                    <span>
                      <span className="text-yellow-600">⏳ {formatNumber(totalPendingBlocks, 0)}</span>
                      <span className="text-muted-foreground ml-1">{t('pool.pending')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Add block reward information */}
              {totalConfirmedBlocks > 0 && (
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">{t('pool.totalRewards')}: </span>
                    <span>{formatNumber(totalConfirmedRewards, 8)} {pool.coin.symbol}</span>
                    {hasPriceData && totalRewardsUsd !== null && (
                      <span className="text-green-500 text-xs ml-1">
                        (≈${formatNumber(totalRewardsUsd, 2)})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {pool.lastPoolBlockTime ? (
                <>{t('pool.lastBlock')}: {formatRelativeTime(pool.lastPoolBlockTime)}</>
              ) : (
                <>{t('pool.noBlocksFound')}</>
              )}
            </p>
            <Button
              variant="link"
              className="px-0 mt-2"
              asChild
            >
              <Link href={`/pools/${pool.id}/blocks`}>
                {t('pool.viewAllBlocks')} →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="mb-8">
        <PoolPerformance poolId={pool.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pool Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('pool.poolInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Payment Information */}
              <div>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-muted-foreground">{t('pool.poolAddress')}</div>
                  <div className="font-mono text-xs break-all">{pool.address}</div>

                  <div className="text-muted-foreground">{t('pool.fee')}</div>
                  <div>{pool.poolFeePercent}%</div>

                  <div className="text-muted-foreground">{t('pool.paymentScheme')}</div>
                  <div>
                    {pool.paymentProcessing.payoutScheme}
                    {pool.paymentProcessing.payoutSchemeConfig?.factor && (
                      <span className="text-muted-foreground ml-1">
                        ({t('pool.factor')}: {pool.paymentProcessing.payoutSchemeConfig.factor})
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground">{t('pool.minimumPayment')}</div>
                  <div>{pool.paymentProcessing.minimumPayment} {pool.coin.symbol}</div>

                  <div className="text-muted-foreground">{t('pool.totalPaid')}</div>
                  <div>{formatNumber(pool.totalPaid)} {pool.coin.symbol}</div>

                  <div className="text-muted-foreground">{t('pool.connectionTimeout')}</div>
                  <div>{pool.clientConnectionTimeout}s</div>

                  <div className="text-muted-foreground">{t('pool.blockRefresh')}</div>
                  <div>{pool.blockRefreshInterval}s</div>

                  {pool.poolEffort > 0 && (
                    <>
                      <div className="text-muted-foreground">{t('pool.poolEffort')}</div>
                      <div className={pool.poolEffort > 100 ? "text-red-500" : "text-green-500"}>
                        {pool.poolEffort.toFixed(1)}%
                      </div>
                    </>
                  )}
                  
                  {/* Add coin price display */}
                  <div className="text-muted-foreground">{t('pool.coinPrice')}</div>
                  {hasPriceData && priceData.price !== null ? (
                    <div className="text-green-500 font-medium">
                      ${formatNumber(priceData.price, 2)}
                      {priceData.price_change_24h !== null && (
                        <span className={priceData.price_change_24h >= 0 ? "text-green-500" : "text-red-500"}>
                          {" "}
                          ({priceData.price_change_24h >= 0 ? '+' : ''}{formatNumber(priceData.price_change_24h, 2)})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      {t('common.na')} {/* Price data not available */}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{t('network.information')}</CardTitle>
            <CardDescription>{t('network.currentStats')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-muted-foreground">{t('network.network')}</div>
              <div>{pool.networkStats?.networkType || t('common.unknown')}</div>

              <div className="text-muted-foreground">{t('network.hashrate')}</div>
              <div>{formatHashrate(pool.networkStats?.networkHashrate || 0)}</div>

              <div className="text-muted-foreground">{t('network.difficulty')}</div>
              <div>{formatDifficulty(pool.networkStats?.networkDifficulty || 0)}</div>

              <div className="text-muted-foreground">{t('network.blockHeight')}</div>
              <div>{formatRawNumber(pool.networkStats?.blockHeight || 0)}</div>

              <div className="text-muted-foreground">{t('network.connectedPeers')}</div>
              <div>{pool.networkStats?.connectedPeers || 0}</div>

              <div className="text-muted-foreground">{t('network.nodeStatus')}</div>
              <div>
                {(() => {
                  const networkStats = pool.networkStats;

                  // If no network stats or all zeros, show disconnected
                  if (!networkStats ||
                    (networkStats.blockHeight === 0 &&
                      networkStats.connectedPeers === 0 &&
                      networkStats.networkHashrate === 0)) {
                    return <span className="text-red-500">{t('network.status.disconnected')}</span>;
                  }

                  // If explicitly syncing
                  if (networkStats.isSyncing) {
                    return (
                      <span className="text-yellow-500">
                        {t('network.status.syncing')} ({networkStats.syncProgress?.toFixed(1) || 0}%)
                      </span>
                    );
                  }

                  // If has valid data and not syncing, show synced
                  if (networkStats.blockHeight > 0 && networkStats.connectedPeers > 0) {
                    return <span className="text-green-500">{t('network.status.synced')}</span>;
                  }

                  // Otherwise show unknown
                  return <span className="text-gray-500">{t('common.unknown')}</span>;
                })()}
              </div>

              <div className="text-muted-foreground">{t('network.lastBlock')}</div>
              <div>{formatRelativeTime(pool.networkStats?.lastNetworkBlockTime || new Date().toISOString())}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Locations & Connection Info Card */}
      <div className="mt-8">
        <Card>
          <CardContent>
            <div className="space-y-6">
              {/* Server Locations */}
              {(() => {
                // Check if we have stratumServers from API
                if (pool.stratumServers && Object.keys(pool.stratumServers).length > 0) {
                  return (
                    <>
                      <div>
                        <h3 className="text-lg font-medium mb-2">{t('server.locations')}</h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t('server.location')}</TableHead>
                                <TableHead>{t('server.host')}</TableHead>
                                <TableHead>{t('server.ports')}</TableHead>
                                <TableHead>{t('server.status')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(pool.stratumServers)
                                .sort(([keyA], [keyB]) => {
                                  // Sort by ping - lowest first, offline last, null (testing) in middle
                                  const pingA = serverPings[keyA];
                                  const pingB = serverPings[keyB];

                                  // Handle offline servers (put them last)
                                  if (pingA === 'offline' && pingB === 'offline') return 0;
                                  if (pingA === 'offline') return 1;
                                  if (pingB === 'offline') return -1;

                                  // Handle testing/null values (put them in middle)
                                  if (pingA === null && pingB === null) return 0;
                                  if (pingA === null) return 1;
                                  if (pingB === null) return -1;

                                  // Both are numbers, sort by latency
                                  return (pingA as number) - (pingB as number);
                                })
                                .map(([key, server]) => (
                                  <TableRow key={key}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={getFlagImageUrl(key)}
                                          alt={`${server.region} ${t('common.flag')}`}
                                          className="w-6 h-4 object-cover rounded-sm"
                                          onError={(e) => {
                                            // Fallback to UN flag if country flag fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/un.svg';
                                          }}
                                        />
                                        <span className="font-medium">{server.region}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <code className="text-xs">{server.host}</code>
                                    </TableCell>
                                    <TableCell>
                                      {server.ports.join(', ')}
                                    </TableCell>
                                    <TableCell>
                                      {serverPings[key] === 'offline' ? (
                                        <span className="text-red-500 text-sm font-medium">
                                          {t('server.status.offline')}
                                        </span>
                                      ) : serverPings[key] !== null ? (
                                        <span className={`text-sm font-medium ${
                                          (serverPings[key] as number) < 100 ? "text-green-500" :
                                            (serverPings[key] as number) < 200 ? "text-yellow-500" :
                                              "text-red-500"
                                        }`}>
                                          {serverPings[key]}ms
                                        </span>
                                      ) : (
                                        <span className="text-gray-500 text-sm">
                                          {t('server.status.testing')}
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <Separator />
                    </>
                  );
                } else {
                  // Fallback: Use pool.ports and stratumConfig for mapping
                  const uniqueHosts = new Set<string>();
                  const fallbackServers: Array<{ host: string, ports: string[], region: string }> = [];

                  // Extract unique hosts from pool.ports using addressMap
                  Object.entries(pool.ports).forEach(([port, portDetails]) => {
                    const mappedHost = stratumConfig.addressMap[portDetails.listenAddress] || stratumConfig.defaultHost;
                    if (!uniqueHosts.has(mappedHost)) {
                      uniqueHosts.add(mappedHost);
                      // Get all ports for this host
                      const portsForHost = Object.entries(pool.ports)
                        .filter(([_, details]) => {
                          const host = stratumConfig.addressMap[details.listenAddress] || stratumConfig.defaultHost;
                          return host === mappedHost;
                        })
                        .map(([p]) => p);

                      fallbackServers.push({
                        host: mappedHost,
                        ports: portsForHost,
                        region: stratumConfig.defaultHost === mappedHost
                          ? t('server.default')
                          : t('server.custom')
                      });
                    }
                  });

                  if (fallbackServers.length > 0) {
                    return (
                      <>
                        <div>
                          <h3 className="text-lg font-medium mb-2">{t('server.locations')}</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('server.location')}</TableHead>
                                  <TableHead>{t('server.host')}</TableHead>
                                  <TableHead>{t('server.ports')}</TableHead>
                                  <TableHead>{t('server.status')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {fallbackServers.map((server, index) => (
                                  <TableRow key={`${server.host}-${index}`}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <img
                                          src="https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/un.svg"
                                          alt={t('server.defaultFlag')}
                                          className="w-6 h-4 object-cover rounded-sm"
                                        />
                                        <span className="font-medium">{server.region}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <code className="text-xs">{server.host}</code>
                                    </TableCell>
                                    <TableCell>
                                      {server.ports.join(', ')}
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-gray-500 text-sm">
                                        {t('server.available')}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <Separator />
                      </>
                    );
                  }
                  return null;
                }
              })()}
              {/* Connection Ports */}
              <div>
                <h3 className="text-lg font-medium mb-2">{t('server.ports')}</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('server.port')}</TableHead>
                        <TableHead>{t('server.difficulty')}</TableHead>
                        <TableHead>{t('server.varDifficulty')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(pool.ports).map(([port, details]) => (
                        <TableRow key={port}>
                          <TableCell className="font-medium">{port}</TableCell>
                          <TableCell>{details.difficulty}</TableCell>
                          <TableCell>
                            {details.varDiff ? (
                              <>{t('server.min')}: {details.varDiff.minDiff}</>
                            ) : (
                              t('server.fixed')
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <PoolBlocks poolId={pool.id} symbol={pool.coin.symbol} />
      </div>
    </div>
  );
}