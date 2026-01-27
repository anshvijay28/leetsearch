"use client";

import { useState, useRef, useEffect } from "react";
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
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: [],
    excludePremium: false,
    includeTags: [],
  });

  useEffect(() => {
    const persisted = getPersistedState();
    if (persisted) {
      setQuery(persisted.query);
      setResults(persisted.results);
      setFilters(persisted.filters);
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
    return count;
  };

  const handleListsClick = () => {
    setComingSoonFeature("lists");
    setShowComingSoon(true);
  };

  return (
    <div className="h-[calc(100vh-72px)] overflow-hidden flex flex-col relative">
      <div className="flex-1 flex flex-col">
        <div className="relative z-10 flex flex-col h-full min-h-0">
          <main className="flex-1 min-h-0 flex flex-col items-center px-4 py-6 md:py-10 relative z-10">
            <div className={`w-full max-w-6xl mx-auto flex flex-col gap-8 h-full ${results.length === 0 ? 'justify-center' : ''}`}>
              <div className="w-full max-w-3xl mx-auto flex flex-col h-full min-h-0">
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
                    filterButtonRef={filterButtonRef}
                  />
                </div>
                <div className="flex-1 min-h-0">
                  <ResultsList
                    results={results}
                    isLoading={isLoading}
                  />
                </div>
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
            filterButtonRef={filterButtonRef}
          />
        </div>
      </div>
    </div>
  );
}
