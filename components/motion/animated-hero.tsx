"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/ui/coin-icon";
import {
  formatHashrate,
  formatNumber,
  formatCurrency,
} from "@/lib/utils/format";
import { LiveStatsCard } from "./live-stats-card";
import { useWebSocket } from "@/contexts/websocket-context";
import { useLiveData } from "@/contexts/live-data-context";
import { useLanguage } from "@/contexts/language-context";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

interface AnimatedHeroProps {
  pools: any[];
  totalMiners: number;
  totalHashrate: number;
  totalPaid: number;
}

export function AnimatedHero({
  pools: initialPools,
  totalMiners: initialTotalMiners,
  totalHashrate: initialTotalHashrate,
  totalPaid,
}: AnimatedHeroProps) {
  const { isConnected } = useWebSocket();
  const { pools, poolHashrates } = useLiveData();
  const { t } = useLanguage();

  // Update pools with live hashrate data
  const updatedPools = pools.map((pool) => ({
    ...pool,
    poolStats: {
      ...pool.poolStats,
      poolHashrate: poolHashrates[pool.id] ?? pool.poolStats?.poolHashrate ?? 0,
      connectedMiners: pool.poolStats?.connectedMiners ?? 0,
    },
  }));

  // Calculate live totals
  const liveHashrateFromWS = Object.values(poolHashrates).reduce(
    (sum, rate) => sum + rate,
    0
  );
  const totalHashrate =
    liveHashrateFromWS > 0
      ? liveHashrateFromWS
      : updatedPools.reduce(
          (sum, pool) => sum + (pool.poolStats?.poolHashrate || 0),
          0
        );
  const totalMiners = updatedPools.reduce(
    (sum, pool) => sum + (pool.poolStats?.connectedMiners || 0),
    0
  );
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/Hero_Image.jpg')",
        }}
      />

      {/* Background Overlay - Theme Aware */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-muted/50 dark:from-background/90 dark:via-background/80 dark:to-muted/60" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs - Theme Aware */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-primary/20 dark:to-secondary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-blue-500/15 to-purple-500/15 dark:from-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid Pattern - Theme Aware */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Floating Icons - Theme Aware */}
        <motion.div
          className="absolute top-32 right-32 text-primary/15 dark:text-primary/10"
          variants={floatingVariants}
          animate="animate"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-32 text-secondary/15 dark:text-secondary/10"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "1s" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Content */}
          <motion.div className="space-y-8" variants={itemVariants}>
            <div className="space-y-4">
              <motion.div
                className="flex justify-center mb-6"
                variants={itemVariants}
              >
                <Image
                  src="/images/logo.png"
                  alt="kryptokyng logo"
                  width={150}
                  height={150}
                  className="transition-transform hover:scale-105"
                />
              </motion.div>
              <motion.h1
                className="text-xl md:text-6xl lg:text-7xl font-medium text-foreground leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                style={{ fontFamily: "Whisper, cursive" }}
                variants={itemVariants}
              >
                 Kriptokyng Pool
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed"
                variants={itemVariants}
              >
                {t("home.mine")} {""}
                {[...new Set(pools.map((pool) => pool.coin.symbol))]
                  .slice(0, 5)
                  .join(", ")}
                {pools.length > 5 ? ` ${t("home.andMore")}` : ""} {" "}
                {t("home.heroTail")}
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
              >
                <Link href="/connect">
                  {t("home.startMining")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-8 border-2 hover:bg-muted/50 dark:hover:bg-muted/30"
              >
                <Link href="/pools">
                  {t("home.viewPools")} <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50"
              variants={statsVariants}
            >
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 dark:from-muted/50 dark:to-muted/20 border border-border/30">
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(totalMiners, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("home.miners")}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 dark:from-muted/50 dark:to-muted/20 border border-border/30">
                <div className="text-2xl font-bold text-foreground flex items-baseline justify-center">
                  {formatHashrate(totalHashrate).split(" ")[0]}
                  <span className="ml-1 text-base text-muted-foreground">
                    {formatHashrate(totalHashrate).split(" ")[1]}
                  </span>
                  {liveHashrateFromWS > 0 && (
                    <span className="ml-2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("home.hashrate")}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 dark:from-muted/50 dark:to-muted/20 border border-border/30">
                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    99.9%
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm text-muted-foreground">{t("home.uptime")}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <LiveStatsCard
            initialPools={updatedPools}
            initialTotalMiners={totalMiners}
            initialTotalHashrate={totalHashrate}
            initialTotalPaid={totalPaid}
          />
        </motion.div>
      </div>
    </section>
  );
}
