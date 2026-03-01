"use client";

import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronRight, Users, Cpu, Database } from "lucide-react";
import { siteConfig } from "@/config/Site";
import { useLanguage } from "@/contexts/language-context";
import { useHomeStats } from "@/lib/hooks/use-home-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoinIcon } from "@/components/ui/coin-icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedHero } from "@/components/motion/animated-hero";
import NotificationBar from "@/components/ui/notification-bar";
import { HomeMainSections } from "@/components/home-main-sections";
import BlockchainsPage from "./blockchains/page";





export default function HomePage() {
  const { data: stats, isLoading, error } = useHomeStats();
  const { t } = useLanguage();
  
  // Use fetched data or fallback to static values
  const totalMiners = stats?.totalMiners || 1254;
  const totalHashrate = stats?.totalHashrate || 125;
  const hashrateUnit = stats?.hashrateUnit || "GH/s";
  const totalBlocks = stats?.totalBlocks || 12456;
  const uptime = stats?.uptime || "99.9%";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="min-h-screen w-full grid place-items-center mt-5">
  <div className="w-full px-4 flex flex-col items-center text-center">

    {/* Hero */}
    <div className="max-w-3xl space-y-4">
      <div className="max-w-3xl space-y-4">
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Welcome to
          </h2>
          <h1 
            className="text-xl md:text-6xl lg:text-7xl font-medium text-foreground leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
            style={{ fontFamily: "Whisper, cursive" }}
          >
            Kriptokyng Explorer
          </h1>
        </div>
      </div>
      <p className="text-gray-500 md:text-xl dark:text-gray-400">
        {t("home.tagline")}
      </p>
    </div>

    {/* Stats */}
    <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 max-w-6xl w-full">
      
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center shadow-sm">
        <Users className="h-6 w-6 text-muted-foreground mb-2" />
        <h3 className="text-sm font-medium">{t("home.stats.miners")}</h3>
        <p className="mt-2 text-2xl font-bold">{totalMiners.toLocaleString()}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center shadow-sm">
        <Cpu className="h-6 w-6 text-muted-foreground mb-2" />
        <h3 className="text-sm font-medium">{t("home.stats.hashrate")}</h3>
        <p className="mt-2 text-2xl font-bold">{totalHashrate.toFixed(2)} {hashrateUnit}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center shadow-sm">
        <Database className="h-6 w-6 text-muted-foreground mb-2" />
        <h3 className="text-sm font-medium">{t("home.stats.blocks_found")}</h3>
        <p className="mt-2 text-2xl font-bold">{totalBlocks.toLocaleString()}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 text-center shadow-sm">
        <CheckCircle className="h-6 w-6 text-muted-foreground mb-2" />
        <h3 className="text-sm font-medium">{t("home.stats.uptime")}</h3>
        <p className="mt-2 text-2xl font-bold">{uptime}</p>
      </div>

    </div>
  </div>
  <BlockchainsPage/>
</section>

    </div>
  );
}
