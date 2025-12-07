"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { NewsArticle } from "../lib/types/news";

interface UseNewsReturn {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredArticles: NewsArticle[];
  paginatedArticles: NewsArticle[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  itemsPerPage: number;
}

export function useNews(): UseNewsReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/crypto-news", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === "success") {
        setArticles(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch news");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching crypto news:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter articles based on search query and category
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((article) => {
        const title = article.title.toLowerCase();
        const description = article.description.toLowerCase();
        const category = selectedCategory.toLowerCase();
        
        return title.includes(category) || description.includes(category);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((article) => {
        const title = article.title.toLowerCase();
        const description = article.description.toLowerCase();
        
        return title.includes(query) || description.includes(query);
      });
    }

    return filtered;
  }, [articles, searchQuery, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, currentPage, itemsPerPage]);

  // Handle search with debouncing
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery(""); // Clear search when changing category
    setCurrentPage(1); // Reset to first page when changing category
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    articles,
    isLoading,
    error,
    refetch: fetchNews,
    searchQuery,
    setSearchQuery: handleSearch,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    filteredArticles,
    paginatedArticles,
    currentPage,
    setCurrentPage: handlePageChange,
    totalPages,
    itemsPerPage,
  };
}
