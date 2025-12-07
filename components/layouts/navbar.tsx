"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/Site";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import * as Sheet from "@/components/ui/sheet";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { href: "/blockchains", label: "Blockchains" },
    { href: "/faq", label: "FAQ" },
    { href: "/api", label: "API" },
  ];

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-1 group">
              <Image
                src="/logo-mini.png"
                alt={`${siteConfig.name} Logo`}
                width={32}
                height={32}
                className="transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1 border border-border/50">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Twitter Icon */}
            <a 
              href={siteConfig.links.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            
            {/* Moon Icon */}
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Sheet.Sheet open={isOpen} onOpenChange={setIsOpen}>
              <Sheet.SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </Sheet.SheetTrigger>
              <Sheet.SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <Sheet.SheetHeader className="text-left">
                  <Sheet.SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt={`${siteConfig.name} Logo`}
                      width={20}
                      height={20}
                    />
                    {siteConfig.name}
                  </Sheet.SheetTitle>
                </Sheet.SheetHeader>
                <div className="mt-4 flex flex-col space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-foreground hover:text-primary text-lg font-medium transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </Sheet.SheetContent>
            </Sheet.Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
