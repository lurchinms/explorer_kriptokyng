"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MinerSearchForm } from "./miner-search-form";
import { PoolSelector } from "./pool-selector";
import { useLanguage } from "@/contexts/language-context";

interface Pool {
  id: string;
  coin: {
    symbol: string;
    name: string;
  };
  paymentProcessing?: {
    payoutScheme: string;
  };
}

interface MinerSearchPageProps {
  pools: Pool[];
  onSearch: (poolId: string, address: string) => void;
}

export function MinerSearchPage({ pools, onSearch }: MinerSearchPageProps) {
  const { t } = useLanguage();
  const [selectedPool, setSelectedPool] = useState<string>("");

  const handlePoolSelect = (poolId: string) => {
    setSelectedPool(poolId);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="container max-w-5xl py-12 px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-5xl font-bold">{t("miners.title")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {t("miners.searchDescription")}
          </p>
        </div>

        <Card className="mt-10 shadow-lg">
          <CardContent className="pb-8 px-8 pt-6">
            <MinerSearchForm 
              pools={pools} 
              onSearch={onSearch}
              selectedPool={selectedPool}
              onPoolSelect={handlePoolSelect}
            />
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">{t("miners.availablePools")}</h2>
          <PoolSelector 
            pools={pools} 
            onPoolSelect={handlePoolSelect}
          />
        </div>
      </div>
    </div>
  );
}
