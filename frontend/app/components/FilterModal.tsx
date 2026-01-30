"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import FilterToggle from "./FilterToggle";

export type FilterOptions = {
  difficulty: string[]; // Array of selected difficulties
  excludePremium: boolean;
  includeTags: string[]; // Array of tags to include (questions must have at least one of these)
  excludeSQL: boolean;
  excludeJSTS: boolean;
};

type FilterModalProps = {
  isOpen: boolean;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
};

const TAGS = [
  'Array',
  'Backtracking',
  'Biconnected Component',
  'Binary Indexed Tree',
  'Binary Search',
  'Binary Search Tree',
  'Binary Tree',
  'Bit Manipulation',
  'Bitmask',
  'Brainteaser',
  'Breadth-First Search',
  'Bucket Sort',
  'Combinatorics',
  'Concurrency',
  'Counting',
  'Counting Sort',
  'Data Stream',
  'Database',
  'Depth-First Search',
  'Design',
  'Divide and Conquer',
  'Doubly-Linked List',
  'Dynamic Programming',
  'Enumeration',
  'Eulerian Circuit',
  'Game Theory',
  'Geometry',
  'Graph',
  'Greedy',
  'Hash Function',
  'Hash Table',
  'Heap (Priority Queue)',
  'Interactive',
  'Iterator',
  'Line Sweep',
  'Linked List',
  'Math',
  'Matrix',
  'Memoization',
  'Merge Sort',
  'Minimum Spanning Tree',
  'Monotonic Queue',
  'Monotonic Stack',
  'Number Theory',
  'Ordered Set',
  'Prefix Sum',
  'Probability and Statistics',
  'Queue',
  'Quickselect',
  'Radix Sort',
  'Randomized',
  'Recursion',
  'Rejection Sampling',
  'Reservoir Sampling',
  'Rolling Hash',
  'Segment Tree',
  'Shell',
  'Shortest Path',
  'Simulation',
  'Sliding Window',
  'Sort',
  'Sorting',
  'Stack',
  'String',
  'String Matching',
  'Strongly Connected Component',
  'Suffix Array',
  'Topological Sort',
  'Tree',
  'Trie',
  'Two Pointers',
  'Union Find',
];

export default function FilterModal({
  isOpen,
  filters,
  onFiltersChange,
  onClose,
}: FilterModalProps) {
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Ensure boolean values are always defined (not undefined) to prevent controlled/uncontrolled component warnings
  const safeFilters = {
    ...filters,
    excludePremium: filters.excludePremium ?? false,
    excludeSQL: filters.excludeSQL ?? false,
    excludeJSTS: filters.excludeJSTS ?? false,
  };

  if (!isOpen) return null;

  const handleDifficultyChange = (difficulty: string) => {
    const currentDifficulties = filters.difficulty || [];

    if (difficulty === "All") {
      // If "All" is clicked, select all difficulties
      const allDifficulties = ["Easy", "Medium", "Hard"];
      const allSelected = allDifficulties.every(d => currentDifficulties.includes(d));

      if (allSelected) {
        // If all are already selected, deselect all
        onFiltersChange({
          ...filters,
          difficulty: [],
        });
      } else {
        // Select all
        onFiltersChange({
          ...filters,
          difficulty: allDifficulties,
        });
      }
    } else {
      // Toggle individual difficulty
      const isSelected = currentDifficulties.includes(difficulty);
      if (isSelected) {
        // Remove from selection
        onFiltersChange({
          ...filters,
          difficulty: currentDifficulties.filter(d => d !== difficulty),
        });
      } else {
        // Add to selection
        onFiltersChange({
          ...filters,
          difficulty: [...currentDifficulties, difficulty],
        });
      }
    }
  };

  const handlePremiumToggle = () => {
    onFiltersChange({
      ...safeFilters,
      excludePremium: !safeFilters.excludePremium,
    });
  };

  const handleSQLToggle = () => {
    onFiltersChange({
      ...safeFilters,
      excludeSQL: !safeFilters.excludeSQL,
    });
  };

  const handleJSTSToggle = () => {
    onFiltersChange({
      ...safeFilters,
      excludeJSTS: !safeFilters.excludeJSTS,
    });
  };

  const handleTagToggle = (tag: string) => {
    const newIncludeTags = filters.includeTags.includes(tag)
      ? filters.includeTags.filter((t) => t !== tag)
      : [...filters.includeTags, tag];

    onFiltersChange({
      ...filters,
      includeTags: newIncludeTags,
    });
  };

  const handleClearAll = () => {
    onFiltersChange({
      difficulty: [],
      excludePremium: false,
      includeTags: [],
      excludeSQL: false,
      excludeJSTS: false,
    });
  };

  const filteredTags = TAGS.filter((tag) =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const hasActiveFilters =
    (safeFilters.difficulty && safeFilters.difficulty.length > 0) ||
    safeFilters.excludePremium ||
    safeFilters.includeTags.length > 0 ||
    safeFilters.excludeSQL ||
    safeFilters.excludeJSTS;

  const allDifficulties = ["Easy", "Medium", "Hard"];
  const allSelected = allDifficulties.every(d => safeFilters.difficulty?.includes(d));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Centered modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            "w-full max-w-md",
            "max-h-[85vh] overflow-hidden",
            "rounded-2xl",
            "border border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl",
            "shadow-[0_30px_90px_rgba(0,0,0,0.75)]",
            "pointer-events-auto"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-white/95 dark:bg-black/95 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">
                  Filters
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-white/50">
                  Refine results by difficulty, premium, and tags.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  disabled={!hasActiveFilters}
                  className={cn(
                    "h-9 rounded-xl px-3 text-xs font-medium transition-colors",
                    hasActiveFilters
                      ? "bg-black/5 text-gray-800 hover:bg-black/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                      : "cursor-not-allowed bg-black/5 text-gray-400 dark:bg-white/5 dark:text-white/30"
                  )}
                >
                  Clear
                </button>
                <button
                  onClick={onClose}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                  aria-label="Close filters"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="max-h-[calc(65vh-140px)] overflow-y-auto scrollbar-hide px-5 py-5">
            <div className="space-y-6">
              {/* Difficulty */}
              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60">
                    Difficulty
                  </h3>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {["All", "Easy", "Medium", "Hard"].map((difficulty) => {
                    const isSelected =
                      difficulty === "All"
                        ? allSelected
                        : safeFilters.difficulty?.includes(difficulty) || false;

                    const selectedClasses =
                      difficulty === "Easy"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-500/30"
                        : difficulty === "Medium"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-200 border-amber-500/30"
                          : difficulty === "Hard"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-200 border-rose-500/30"
                            : "bg-white/10 text-gray-900 dark:text-white/90 border-white/20";

                    return (
                      <button
                        key={difficulty}
                        onClick={() => handleDifficultyChange(difficulty)}
                        className={cn(
                          "h-9 rounded-xl border text-xs font-semibold transition-colors",
                          isSelected
                            ? selectedClasses
                            : "bg-black/5 text-gray-700 border-black/10 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white/80"
                        )}
                      >
                        {difficulty}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Premium */}
              <FilterToggle
                title="Exclude premium"
                description="Hide problems that require LeetCode Premium."
                checked={safeFilters.excludePremium}
                onChange={handlePremiumToggle}
              />

              {/* SQL Filter */}
              <FilterToggle
                title="Exclude SQL questions"
                description="Hide SQL-only problems."
                checked={safeFilters.excludeSQL}
                onChange={handleSQLToggle}
              />

              {/* JS/TS Filter */}
              <FilterToggle
                title="Exclude JS/TS-only questions"
                description="Hide JavaScript/TypeScript-only problems."
                checked={safeFilters.excludeJSTS}
                onChange={handleJSTSToggle}
              />

              {/* Tags */}
              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60">
                    Include tags
                  </h3>
                  <div className="text-xs text-white/40">
                    {safeFilters.includeTags.length} selected
                  </div>
                </div>

                {safeFilters.includeTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {safeFilters.includeTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-black/5 px-2.5 py-1 text-xs text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                      >
                        <span className="truncate max-w-[14rem]">{tag}</span>
                        <button
                          onClick={() => handleTagToggle(tag)}
                          className="text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80 transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="Search tags…"
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/20 dark:focus:ring-white/10"
                  />
                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <div className="max-h-72 overflow-y-auto scrollbar-hide p-2 bg-white dark:bg-transparent">
                    {filteredTags.length === 0 ? (
                      <p className="px-2 py-6 text-sm text-gray-500 dark:text-white/40">No tags found</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-1">
                        {filteredTags.map((tag) => {
                          const isIncluded = safeFilters.includeTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => handleTagToggle(tag)}
                              className={cn(
                                "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                                "flex items-center justify-between gap-3",
                                isIncluded
                                  ? "bg-black/5 text-gray-900 border border-black/10 dark:bg-white/10 dark:text-white dark:border-white/10"
                                  : "bg-transparent text-gray-800 hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/5"
                              )}
                            >
                              <span className="truncate">{tag}</span>
                              {isIncluded && (
                                <svg className="h-4 w-4 text-gray-700 dark:text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-white/10 bg-white/95 dark:bg-black/95 px-5 py-4">
            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl bg-black text-white text-sm font-semibold transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

