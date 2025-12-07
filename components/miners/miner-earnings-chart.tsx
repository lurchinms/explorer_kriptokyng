"use client";

import React from "react";
import { formatNumber } from "@/lib/utils/format";
import { useMinerDailyEarnings } from "@/lib/hooks/use-miningcore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  BarChart,
  Bar
} from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useLanguage } from "@/contexts/language-context";

interface MinerEarningsChartProps {
  poolId: string;
  address: string;
  coinSymbol: string;
}

export function MinerEarningsChart({ poolId, address, coinSymbol }: MinerEarningsChartProps) {
  const { t } = useLanguage();
  const { 
    data: earningsData = [], 
    isLoading, 
    isError 
  } = useMinerDailyEarnings(poolId, address);

  // Process data for the chart
  const processedData = React.useMemo(() => {
    return earningsData
      .map((item) => {
        const date = new Date(item.date);
        return {
          ...item,
          day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          fullDate: date.toLocaleDateString("en-US", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          }),
          amount: Number(item.amount),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [earningsData]);

  // Calculate total earnings
  const totalEarnings = React.useMemo(() => {
    return earningsData.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [earningsData]);

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="rounded-md border bg-background p-3 shadow-sm">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-sm">
            <span className="font-medium">Earnings:</span>{" "}
            {formatNumber(data.amount)} {coinSymbol}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('minerEarnings.title')}</CardTitle>
          <CardDescription>{t('minerEarnings.loading')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError || earningsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('minerEarnings.title')}</CardTitle>
          <CardDescription>{t('minerEarnings.noData')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center">
            <p className="text-muted-foreground">{t('minerEarnings.noRecords')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('minerEarnings.title')}</CardTitle>
        <CardDescription>
          {t('minerEarnings.total')}: {formatNumber(totalEarnings)} {coinSymbol} in the last {processedData.length} {t('minerEarnings.days')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="day" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
              />
              <YAxis 
                tickFormatter={(value) => formatNumber(value, 2)} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                name={`${t('minerEarnings.earnings')} (${coinSymbol})`} 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}