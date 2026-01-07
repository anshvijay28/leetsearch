"use client";

import { useRef } from "react";

type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  error?: string;
  isLoading?: boolean;
  onFilterClick?: () => void;
  filterActiveCount?: number;
  filterButtonRef?: React.RefObject<HTMLButtonElement | null>;
};

export default function SearchBar({ 
  query, 
  onQueryChange, 
  onSearch, 
  error, 
  isLoading = false,
  onFilterClick,
  filterActiveCount = 0,
  filterButtonRef,
}: SearchBarProps) {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const hasError = !!error;
  const isEmpty = !query.trim();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className={`flex-1 flex items-center gap-3 rounded-full bg-black/50 px-4 py-3 border transition-colors ${
          hasError 
            ? "border-rose-500/50 bg-rose-950/20" 
            : "border-transparent"
        }`}>
          <svg
            className={`w-5 h-5 shrink-0 transition-colors ${
              hasError ? "text-rose-400" : "text-zinc-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "graph problems to practice BFS with medium difficulty"'
            className={`flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-zinc-600 ${
              hasError ? "text-rose-200 placeholder:text-rose-600/50" : ""
            }`}
            autoFocus
          />
          <button
            onClick={onSearch}
            disabled={isEmpty || isLoading}
            className={`shrink-0 rounded-full text-white text-sm md:text-base font-semibold px-5 py-2.5 transition-colors flex items-center gap-2 ${
              isEmpty || isLoading
                ? "bg-zinc-600 cursor-not-allowed opacity-50"
                : hasError
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-[#06b6d4] hover:bg-[#0891b2]"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Searching...</span>
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
        {onFilterClick && (
          <button
            ref={filterButtonRef}
            onClick={onFilterClick}
            className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-full bg-black/50 border border-[#06b6d4]/20 hover:border-[#06b6d4]/40 hover:bg-gradient-to-r hover:from-[#0f1f35] hover:via-[#15243a] hover:to-[#0f1f35] transition-all relative"
          >
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-semibold text-white">Filter</span>
            {filterActiveCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {filterActiveCount}
              </span>
            )}
          </button>
        )}
      </div>
      {hasError && (
        <div className="mt-2 ml-4 flex items-center gap-2 text-rose-400 text-sm">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

