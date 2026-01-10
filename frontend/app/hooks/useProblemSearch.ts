"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Question } from "../types";

export function useProblemSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [browseMode, setBrowseMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchQuery.trim();

    if (trimmed === "") {
      setBrowseMode(true);
      setSearchResults([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setBrowseMode(false);
      setIsSearching(true);
      setError(null);

      try {
        const response = await axios.get<Question[]>("/api/py/problems/search", {
          params: { query: trimmed, limit: 20 },
        });
        setSearchResults(response.data);
      } catch (err) {
        console.error("Failed to search problems:", err);
        setError("Failed to search problems. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const resetSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setBrowseMode(true);
    setError(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    browseMode,
    error,
    setError,
    resetSearch,
  };
}

