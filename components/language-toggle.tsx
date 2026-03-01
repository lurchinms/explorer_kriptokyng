"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountryFlag } from "@/components/ui/country-flag";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: "en" as const, label: "English", flag: "en" },
    { code: "fr" as const, label: "Français", flag: "fr" },
    { code: "ru" as const, label: "Русский", flag: "ru" },
    { code: "ar" as const, label: "العربية", flag: "ar" },
    { code: "ja" as const, label: "日本語", flag: "ja" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={t("common.language")}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? "bg-muted" : ""}
          >
            <span className="flex items-center gap-3 w-full">
              <CountryFlag country={lang.flag} className="text-base" />
              <span className="flex-1">{lang.label}</span>
              {language === lang.code && (
                <span className="text-xs text-green-600">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
