"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatHashrate, formatDifficulty, formatNumber } from "@/lib/utils/format";
import { usePoolPerformance } from "@/lib/hooks/use-miningcore";
import { Loader2, Info } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface PerformanceChartsProps {
  poolId: string;
}

export function PerformanceCharts({ poolId }: PerformanceChartsProps) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = React.useState("7d");
  const [currentTab, setCurrentTab] = React.useState("hashrate");

  const {
    data: performanceData = [],
    isLoading,
    isError
  } = usePoolPerformance(poolId);

  const processedData = React.useMemo(() => {
    // First convert and sort all the data
    const converted = performanceData
      .map((item) => ({
        ...item,
        date: item.created,
        formattedDate: new Date(item.created).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        time: new Date(item.created).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        poolHashrate: Number(item.poolHashrate) || 0,
        networkHashrate: Number(item.networkHashrate) || 0,
        networkDifficulty: Number(item.networkDifficulty) || 0,
        connectedMiners: Number(item.connectedMiners) || 0,
      }))
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

    // Then filter by time range
    let daysToSubtract = 7;
    
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "90d") {
      daysToSubtract = 90;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    return converted.filter(item => new Date(item.created) >= startDate);
  }, [performanceData, timeRange]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('poolPerformance.title')}</CardTitle>
          <CardDescription>{t('poolPerformance.loading')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('poolPerformance.title')}</CardTitle>
          <CardDescription>{t('poolPerformance.errorTitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Info className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">{t('poolPerformance.errorDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Define chart configs for each chart type with explicit colors
  const hashrateConfig = {
    poolHashrate: {
      label: t('poolPerformance.poolHashrate'), 
      color: "#3b82f6", // Explicit blue color
    },
    networkHashrate: {
      label: t('poolPerformance.networkHashrate'),
      color: "#8b5cf6", // Explicit purple color
    },
  } satisfies ChartConfig;

  const difficultyConfig = {
    networkDifficulty: {
      label: t('poolPerformance.networkDifficulty'),
      color: "#3b82f6", // Same blue color
    },
  } satisfies ChartConfig;

  const minersConfig = {
    connectedMiners: {
      label: t('poolPerformance.connectedMiners'),
      color: "#10b981", // Green color
    },
  } satisfies ChartConfig;

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab}>
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>
              {currentTab === "hashrate" ? t('poolPerformance.poolHashrate') : 
               currentTab === "difficulty" ? t('poolPerformance.networkDifficulty') : 
               t('poolPerformance.connectedMiners')}
            </CardTitle>
            <CardDescription>
              {currentTab === "hashrate" ? t('performance.hashrateDescription') :
               currentTab === "difficulty" ? t('performance.difficultyDescription') :
               t('performance.minersDescription')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TabsList className="h-9 bg-muted/50">
              <TabsTrigger value="hashrate" className="text-xs md:text-sm">{t('performance.hashrate')}</TabsTrigger>
              <TabsTrigger value="difficulty" className="text-xs md:text-sm">{t('performance.difficulty')}</TabsTrigger>
              <TabsTrigger value="miners" className="text-xs md:text-sm">{t('performance.miners')}</TabsTrigger>
            </TabsList>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[120px] rounded-lg sm:ml-auto"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="7d" className="rounded-lg">
                  {t('performance.last7Days')}
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  {t('performance.last30Days')}
                </SelectItem>
                <SelectItem value="90d" className="rounded-lg">
                  {t('performance.last90Days')}
                </SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {/* Hashrate Chart */}
          {currentTab === "hashrate" && (
            <ChartContainer
              config={hashrateConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={processedData}>
                <defs>
                  <linearGradient id="fillPoolHashrate" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#3b82f6" // Explicit blue color
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6" // Same blue color
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillNetworkHashrate" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#8b5cf6" // Explicit purple color
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#8b5cf6" // Same purple color
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} ${date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}`;
                      }}
                      formatter={(value, name) => {
                        return [formatHashrate(Number(value)), name];
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="networkHashrate"
                  type="natural"
                  fill="url(#fillNetworkHashrate)"
                  stroke="#8b5cf6" 
                />
                <Area
                  dataKey="poolHashrate"
                  type="natural"
                  fill="url(#fillPoolHashrate)"
                  stroke="#3b82f6"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}

          {/* Difficulty Chart */}
          {currentTab === "difficulty" && (
            <ChartContainer
              config={difficultyConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={processedData}>
                <defs>
                  <linearGradient id="fillNetworkDifficulty" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-networkDifficulty)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-networkDifficulty)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} ${date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}`;
                      }}
                      formatter={(value, name) => {
                        return [formatDifficulty(Number(value)), name];
                      }}
                      indicator="dot" />
                  }
                />
                <Area
                  dataKey="networkDifficulty"
                  type="natural"
                  fill="url(#fillNetworkDifficulty)"
                  stroke="var(--color-networkDifficulty)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}

          {/* Miners Chart */}
          {currentTab === "miners" && (
            <ChartContainer
              config={minersConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={processedData}>
                <defs>
                  <linearGradient id="fillConnectedMiners" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-connectedMiners)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-connectedMiners)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} ${date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}`;
                      }}
                      formatter={(value, name) => {
                        return [formatNumber(Number(value), 0), name];
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="connectedMiners"
                  type="natural"
                  fill="url(#fillConnectedMiners)"
                  stroke="var(--color-connectedMiners)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </Tabs>
  );
}