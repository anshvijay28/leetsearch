"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Question } from "./types";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import ComingSoonModal from "./components/ComingSoonModal";
import FilterModal, { FilterOptions } from "./components/FilterModal";

const STORAGE_KEY = "leetsearch_state";

type PersistedState = {
  query: string;
  results: Question[];
  filters: FilterOptions;
};

const getPersistedState = (): PersistedState | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const persistState = (state: PersistedState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to persist search state");
  }
};


export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Question[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<"lists" | "roadmaps" | null>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: [],
    excludePremium: false,
    includeTags: [],
    excludeSQL: false,
    excludeJSTS: false,
  });

  useEffect(() => {
    const persisted = getPersistedState();
    if (persisted) {
      setQuery(persisted.query);
      setResults(persisted.results);
      // Ensure all filter fields are defined (handle migration from old persisted state)
      setFilters({
        difficulty: persisted.filters.difficulty || [],
        excludePremium: persisted.filters.excludePremium ?? false,
        includeTags: persisted.filters.includeTags || [],
        excludeSQL: persisted.filters.excludeSQL ?? false,
        excludeJSTS: persisted.filters.excludeJSTS ?? false,
      });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    persistState({ query, results, filters });
  }, [query, results, filters, isHydrated]);

  const handleSearch = async () => {
    // Validate query
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchError("Please enter a search query");
      return;
    }

    // Clear any previous errors
    setSearchError("");
    setIsLoading(true);

    try {
      // Build query parameters with filters
      const params: Record<string, any> = { query: trimmedQuery };

      // Send arrays directly - Axios will convert to ?difficulty=Easy&difficulty=Medium format
      if (filters.difficulty.length > 0) {
        params.difficulty = filters.difficulty;
      }

      if (filters.excludePremium) {
        params.exclude_premium = true;
      }

      if (filters.includeTags.length > 0) {
        params.include_tags = filters.includeTags;
      }

      if (filters.excludeSQL) {
        params.exclude_sql = true;
      }

      if (filters.excludeJSTS) {
        params.exclude_js_ts = true;
      }

      // Print filter params to console
      console.log("Filter Parameters:", params);

      const response = await axios.get<Question[]>('/api/py/search', {
        params,
        paramsSerializer: {
          indexes: null // This tells Axios to use ?param=value&param=value2 format
        }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setSearchError(error.response.data?.detail || "Invalid search query");
      } else {
        setSearchError("An error occurred while searching. Please try again.");
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };


  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.difficulty.length > 0) count++;
    if (filters.excludePremium) count++;
    if (filters.includeTags.length > 0) count++;
    if (filters.excludeSQL) count++;
    if (filters.excludeJSTS) count++;
    return count;
  };

  const handleListsClick = () => {
    setComingSoonFeature("lists");
    setShowComingSoon(true);
  };

  return (
    <div className="flex flex-col relative">
      <div className="flex flex-col">
        <div className="relative z-10 flex flex-col">
          <main className="flex flex-col items-center px-4 py-6 md:py-10 relative z-10">
            <div className={`w-full max-w-6xl mx-auto flex flex-col gap-8 ${results.length === 0 && !isLoading ? 'justify-center min-h-[calc(100vh-72px)]' : ''}`}>
              <div className="w-full max-w-3xl mx-auto flex flex-col">
                {results.length === 0 && !isLoading && (
                  <motion.div
                    className="flex-shrink-0 mb-6 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                      Find your next coding challenge
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Search by topic, difficulty, or describe the problem you want to solve
                    </p>
                  </motion.div>
                )}
                <div className="flex-shrink-0">
                  <SearchBar
                    query={query}
                    onQueryChange={(value) => {
                      setQuery(value);
                      // Clear error when user starts typing
                      if (searchError) setSearchError("");
                    }}
                    onSearch={handleSearch}
                    error={searchError}
                    isLoading={isLoading}
                    onFilterClick={() => setShowFilterModal(true)}
                    filterActiveCount={getActiveFilterCount()}
                    onClear={() => {
                      setResults([]);
                      setQuery("");
                    }}
                    hasResults={results.length > 0}
                  />
                </div>
                {results.length > 0 || isLoading ? (
                  <div>
                    <ResultsList
                      results={results}
                      isLoading={isLoading}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </main>

          <ComingSoonModal
            isOpen={showComingSoon}
            feature={comingSoonFeature}
            onClose={() => setShowComingSoon(false)}
          />

          <FilterModal
            isOpen={showFilterModal}
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterModal(false)}
          />
        </div>
      </div>
    </div>
  );
}
