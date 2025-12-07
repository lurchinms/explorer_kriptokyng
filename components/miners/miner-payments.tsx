"use client";

import { useMinerPayments } from "@/lib/hooks/use-miningcore";
import { formatNumber } from "@/lib/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCryptoPrice } from "@/lib/hooks/use-crypto-price";
import { useLanguage } from "@/contexts/language-context"; // Added import

interface MinerPaymentsProps {
  poolId: string;
  address: string;
  coinSymbol: string;
}

export function MinerPayments({ poolId, address, coinSymbol }: MinerPaymentsProps) {
  const { t } = useLanguage(); // Added language hook
  
  const { 
    data: payments = [], 
    isLoading, 
    isError 
  } = useMinerPayments(poolId, address);
  
  // Fetch crypto price data
  const { data: priceData } = useCryptoPrice(coinSymbol, poolId);
  const hasPriceData = priceData && priceData.price !== null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("minerPayments.title")}</CardTitle>
          <CardDescription>{t("minerPayments.loading")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("minerPayments.title")}</CardTitle>
          <CardDescription>{t("minerPayments.noHistory")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center">
            <p className="text-muted-foreground">{t("minerPayments.noRecords")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate total payments
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate total USD value if price data is available
  const totalUsdValue = hasPriceData 
    ? payments.reduce((sum, payment) => sum + (payment.amount * (priceData?.price || 0)), 0)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("minerPayments.title")}</CardTitle>
        <CardDescription>
          {t("minerPayments.total")}: {formatNumber(totalAmount, 8)} {coinSymbol} {t("minerPayments.across")} {payments.length} {t("minerPayments.payments")}
          {totalUsdValue !== null && (
            <span className="ml-1 text-green-500">({t('common.currency.usdApprox')}{formatNumber(totalUsdValue, 2)})</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("minerPayments.date")}</TableHead>
                <TableHead>{t("minerPayments.amount")}</TableHead>
                {hasPriceData && <TableHead>{t("minerPayments.valueUSD")}</TableHead>}
                <TableHead>{t("minerPayments.transaction")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                // Calculate USD value for each payment if price data is available
                const usdValue = hasPriceData && priceData?.price 
                  ? payment.amount * priceData.price
                  : null;
                  
                return (
                  <TableRow key={payment.transactionConfirmationData}>
                    <TableCell>{new Date(payment.created).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(payment.amount, 8)} {coinSymbol}
                    </TableCell>
                    {hasPriceData && (
                      <TableCell className="text-green-500">
                        {t('common.currency.usd')}{formatNumber(usdValue || 0, 2)}
                      </TableCell>
                    )}
                    <TableCell>
                      <Link
                        href={payment.transactionInfoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm hover:text-primary gap-1 truncate max-w-[250px]"
                      >
                        <span className="truncate font-mono text-xs">
                          {payment.transactionConfirmationData.substring(0, 8)}...
                          {payment.transactionConfirmationData.substring(payment.transactionConfirmationData.length - 8)}
                        </span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}