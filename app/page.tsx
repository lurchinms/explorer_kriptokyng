import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronRight, Users, Cpu, Database } from "lucide-react";
import { siteConfig } from "@/config/Site";

// Simple static data
const stats = {
  totalMiners: 1254,
  totalHashrate: 125,
  totalPaid: 0,
  totalBlocks: 12456
};
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

export const metadata: Metadata = {
  title: siteConfig.tagline,
  description: siteConfig.description,
};

// This forces Next.js to always render this page dynamically
export const dynamic = "force-dynamic";
// This instructs Next.js to never cache this page
export const revalidate = 0;

export default function HomePage() {
  // Simple static data
  const { totalMiners, totalHashrate, totalPaid, totalBlocks } = stats;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Welcome to {siteConfig.name}
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                The most efficient and reliable mining pool for KriptoKyng
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-sm font-medium">Miners</h3>
              </div>
              <p className="mt-2 text-2xl font-bold">{totalMiners.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <Cpu className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-sm font-medium">Hashrate</h3>
              </div>
              <p className="mt-2 text-2xl font-bold">{totalHashrate} GH/s</p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-sm font-medium">Blocks Found</h3>
              </div>
              <p className="mt-2 text-2xl font-bold">{totalBlocks.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-sm font-medium">Uptime</h3>
              </div>
              <p className="mt-2 text-2xl font-bold">99.9%</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
