
"use client";

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, TooltipProps
} from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { formatHashrate, formatDifficulty } from "@/lib/utils/format";
import { usePoolPerformance } from "@/lib/hooks/use-miningcore";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface PoolPerformanceProps {
  poolId: string;
}

interface PerformanceDataPoint {
  created: string;
  poolHashrate: number;
  networkHashrate: number;
  networkDifficulty: number;
  connectedMiners: number;
  validSharesPerSecond: number;
  time?: string;
  date?: string;
  networkDifficultyScaled?: number;
}

export function PoolPerformance({ poolId }: PoolPerformanceProps) {
  const { t } = useLanguage();

  const {
    data: performanceData = [],
    isLoading,
    isError
  } = usePoolPerformance(poolId);

  const processedData: PerformanceDataPoint[] = React.useMemo(() => {
    return performanceData
      .map((item) => {
        const date = new Date(item.created);
        return {
          ...item,
          time: date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          poolHashrate: Number(item.poolHashrate) || 0,
          networkHashrate: Number(item.networkHashrate) || 0,
          networkDifficulty: Number(item.networkDifficulty) || 0,
          networkDifficultyScaled: Number(item.networkDifficulty) / 1e15,
          connectedMiners: Number(item.connectedMiners) || 0,
        };
      })
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
  }, [performanceData]);

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>): React.ReactElement | null => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as PerformanceDataPoint;
      return (
        <div className="rounded-md border bg-background p-3 shadow-sm">
          <p className="mb-1 font-medium">{`${data.date} ${data.time}`}</p>
          {payload.map((entry, index) => {
            let displayValue = "";
            try {
              switch (entry.name) {
                case t('poolPerformance.poolHashrate'):
                  displayValue = formatHashrate(data.poolHashrate);
                  break;
                case t('poolPerformance.networkHashrate'):
                  displayValue = formatHashrate(data.networkHashrate);
                  break;
                case t('poolPerformance.networkDifficulty'):
                  displayValue = formatDifficulty(data.networkDifficulty);
                  break;
                case t('poolPerformance.connectedMiners'):
                  displayValue = String(data.connectedMiners);
                  break;
                default:
                  displayValue = String(entry.value);
              }
            } catch (err) {
              console.error("Error formatting tooltip value:", err);
              displayValue = "Error";
            }

            return (
              <p key={index} className="text-sm" style={{ color: entry.color || "#000" }}>
                {entry.name}: {displayValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('poolPerformance.title')}</CardTitle>
          <CardDescription>{t('poolPerformance.loading')}</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError || performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('poolPerformance.title')}</CardTitle>
          <CardDescription>{t('poolPerformance.errorTitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center">
            <p className="text-muted-foreground">{t('poolPerformance.errorDescription')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('poolPerformance.title')}</CardTitle>
        <CardDescription>
          {t('poolPerformance.description')}
          <span className="text-xs text-muted-foreground ml-2">
            ({processedData.length} {t('common.dataPoints')})
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative h-[250px] md:h-[400px] w-full overflow-x-auto">
          <div className="absolute inset-0 min-w-[500px] md:min-w-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processedData}
                margin={{ top: 10, right: 30, left: 60, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  height={40}
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: `${t('poolPerformance.poolHashrate')} (TH/s)`,
                    angle: -90,
                    position: "insideLeft",
                    offset: -50,
                  }}
                  tickFormatter={(value) => (value / 1e12).toFixed(1)}
                  domain={['auto', 'auto']}
                  width={80}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: `${t('poolPerformance.networkHashrate')} (PH/s)`,
                    angle: 90,
                    position: "insideRight",
                    offset: -50,
                  }}
                  tickFormatter={(value) => (value / 1e15).toFixed(1)}
                  domain={['auto', 'auto']}
                  width={80}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="poolHashrate"
                  name={t('poolPerformance.poolHashrate')}
                  stroke="#2563eb"
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="networkHashrate"
                  name={t('poolPerformance.networkHashrate')}
                  stroke="#9333ea"
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
