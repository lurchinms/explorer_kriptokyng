'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define supported languages
type Language = 'en' | 'fr' | 'ru' | 'ar' | 'ja';

// Import translation files
import enTranslations from '@/locales/en.json';
import frTranslations from '@/locales/fr.json';
import ruTranslations from '@/locales/ru.json';
import arTranslations from '@/locales/ar.json';
import jaTranslations from '@/locales/ja.json';

// Define the shape of our translations
type Translations = Record<string, string | Record<string, any>>;

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested translation
const getNestedTranslation = (obj: Translations, path: string): string => {
  return path.split('.').reduce((current, key) => {
    if (typeof current === 'object' && current !== null && key in current) {
      return current[key] as string;
    }
    return `[${path}]`;
  }, obj as any) as string;
};

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>(enTranslations);

  // Load translations based on selected language
  useEffect(() => {
    const loadTranslations = async () => {
      switch (language) {
        case 'fr':
          setTranslations(frTranslations);
          break;
        case 'ru':
          setTranslations(ruTranslations);
          break;
        case 'ar':
          setTranslations(arTranslations);
          break;
        case 'ja':
          setTranslations(jaTranslations);
          break;
        case 'en':
        default:
          setTranslations(enTranslations);
          break;
      }
    };

    loadTranslations();
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return getNestedTranslation(translations, key);
  };

  // Save language preference to localStorage on change
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['en', 'fr', 'ru', 'ar', 'ja'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}