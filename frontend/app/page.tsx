"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Question } from "./types";
import { SAMPLE_QUESTIONS } from "./data/sampleQuestions";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import SearchBar from "./components/SearchBar";
import BackButton from "./components/BackButton";
import ResultsList from "./components/ResultsList";
import ComingSoonModal from "./components/ComingSoonModal";
import FilterModal from "./components/FilterModal";
import { FilterOptions } from "./components/FilterPanel";

export default function Home() {
  const [hasStartedSearching, setHasStartedSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Question[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<"lists" | "roadmaps" | null>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: [],
    excludePremium: false,
    includeTags: [],
  });

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

  const handleBackToHome = () => {
    setHasStartedSearching(false);
    setResults([]);
    setQuery("");
    setSearchError("");
    setShowFilterModal(false);
    setFilters({
      difficulty: [],
      excludePremium: false,
      includeTags: [],
    });
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

  const handleRoadmapsClick = () => {
    setComingSoonFeature("roadmaps");
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen text-white flex flex-col">
      <Header
        onListsClick={handleListsClick}
        onRoadmapsClick={handleRoadmapsClick}
      />

      {!hasStartedSearching ? (
        <LandingPage onBeginSearch={() => setHasStartedSearching(true)} />
      ) : (
        <main className="flex-1 flex flex-col items-center px-4 py-6 md:py-10">
          <div className={`w-full max-w-6xl mx-auto flex flex-col gap-8 ${results.length === 0 ? 'h-full justify-center' : 'h-full'}`}>
            <div className="w-full max-w-3xl mx-auto">
              <BackButton onClick={handleBackToHome} />
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
              <ResultsList
                results={results}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      )}

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
  );
}
