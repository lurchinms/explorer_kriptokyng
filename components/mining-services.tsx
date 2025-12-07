"use client";

import { useLanguage } from "@/contexts/language-context";

export function MiningServices() {
  const { t } = useLanguage();
  return (
    <section className="py-16 bg-background/90 border-t border-border/30">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("home.services.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("home.services.description")}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* MiningRigRentals */}
          <a 
            href="https://www.miningrigrentals.com?ref=2752924" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-card hover:bg-card/80 border border-border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
          >
            <div className="w-20 h-20 mb-4 rounded-lg overflow-hidden border border-border/50">
              <img 
                src="/mrr.jpeg" 
                alt="MiningRigRentals"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg items-center justify-center hidden">
                <span className="text-2xl font-bold text-orange-600">MRR</span>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-center mb-1">MiningRigRentals</h3>
            <p className="text-xs text-muted-foreground text-center">{t("home.services.rentRigs")}</p>
          </a>

          {/* NiceHash */}
          <a 
            href="https://www.nicehash.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-card hover:bg-card/80 border border-border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
          >
            <div className="w-20 h-20 mb-4 rounded-lg overflow-hidden border border-border/50">
              <img 
                src="/nh.png" 
                alt="NiceHash"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg items-center justify-center hidden">
                <span className="text-2xl font-bold text-blue-600">NH</span>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-center mb-1">NiceHash</h3>
            <p className="text-xs text-muted-foreground text-center">{t("home.services.hashMarketplace")}</p>
          </a>

          {/* WhatToMine */}
          <a 
            href="https://whattomine.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-card hover:bg-card/80 border border-border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
          >
            <div className="w-20 h-20 mb-4 rounded-lg overflow-hidden border border-border/50">
              <img 
                src="/wtm.png" 
                alt="WhatToMine"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg items-center justify-center hidden">
                <span className="text-2xl font-bold text-green-600">WTM</span>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-center mb-1">WhatToMine</h3>
            <p className="text-xs text-muted-foreground text-center">{t("home.services.profitabilityCalc")}</p>
          </a>

          {/* MiningPoolStats */}
          <a 
            href="https://miningpoolstats.stream/homie-pool.xyz_pools" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-card hover:bg-card/80 border border-border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
          >
            <div className="w-20 h-20 mb-4 rounded-lg overflow-hidden border border-border/50">
              <img 
                src="/mps.jpg" 
                alt="MiningPoolStats"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg items-center justify-center hidden">
                <span className="text-2xl font-bold text-yellow-600">MPS</span>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-center mb-1">MiningPoolStats</h3>
            <p className="text-xs text-muted-foreground text-center">{t("home.services.poolStats")}</p>
          </a>

          {/* Minerstat */}
          <a 
            href="https://minerstat.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-card hover:bg-card/80 border border-border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
          >
            <div className="w-20 h-20 mb-4 rounded-lg overflow-hidden border border-border/50">
              <img 
                src="/ms.png" 
                alt="Minerstat"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg items-center justify-center hidden">
                <span className="text-2xl font-bold text-purple-600">MS</span>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-center mb-1">Minerstat</h3>
            <p className="text-xs text-muted-foreground text-center">{t("home.services.miningMonitoring")}</p>
          </a>

          {/* HiveOS */}
          <a 
            href="https://hiveon.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-card hover:bg-card/80 border border-border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
          >
            <div className="w-20 h-20 mb-4 rounded-lg overflow-hidden border border-border/50">
              <img 
                src="/os.jpeg" 
                alt="HiveOS"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg items-center justify-center hidden">
                <span className="text-2xl font-bold text-amber-600">OS</span>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-center mb-1">HiveOS</h3>
            <p className="text-xs text-muted-foreground text-center">{t("home.services.miningOs")}</p>
          </a>
        </div>

        <div className="text-center pt-8 mt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground">
            {t("home.services.maximize")} 
            <span className="text-primary font-medium ml-1">{t("home.services.chooseBest")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
