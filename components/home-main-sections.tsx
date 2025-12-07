"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { StratumLocationTable } from "@/components/ui/stratum-location-table";
import { LivePoolTable } from "@/components/pools/live-pool-table";
import { LastMintedCoinsTable } from "@/components/pools/last-minted-coins-table";
import { MiningServices } from "@/components/mining-services";
import { Button } from "@/components/ui/button";

interface HomeMainSectionsProps {
  pools: any[];
}

export function HomeMainSections({ pools }: HomeMainSectionsProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Stats Section */}
      <section className="py-8 bg-background/80 shadow-lg">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4">
              {t("home.stratum.title")}
            </h2>
          </div>
          <StratumLocationTable />
        </div>
      </section>

      {/* Pools Section */}
      <section className="py-8 bg-background/80 shadow-lg mt-4">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t("home.availableMiningPoolsTitle")}
            </h2>
          </div>
          <LivePoolTable pools={pools} />
        </div>
      </section>
      <MiningServices />
      {/* Last Minted Coins Section */}
      <section className="py-8 bg-background/80 shadow-lg mt-4">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t("home.lastMintedCoinsTitle")}
            </h2>
          </div>
          <LastMintedCoinsTable />
        </div>
      </section>

      {/* Mining Services & Partners Section */}

      {/* Call to Action */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto p-8 bg-card rounded-xl border-2 border-border shadow-lg">
            <h2 className="text-3xl font-bold mb-4">
              {t("home.readyToStartTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("home.readyToStartSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/connect">{t("home.connectYourMiners")}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/miners">{t("home.viewDashboard")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
