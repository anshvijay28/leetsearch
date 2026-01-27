"use client";

import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { cn } from "@/lib/utils";

export type FilterOptions = {
  difficulty: string[]; // Array of selected difficulties
  excludePremium: boolean;
  includeTags: string[]; // Array of tags to include (questions must have at least one of these)
};

type FilterModalProps = {
  isOpen: boolean;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
  filterButtonRef?: React.RefObject<HTMLButtonElement | null>;
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
  filterButtonRef,
}: FilterModalProps) {
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [modalPosition, setModalPosition] = useState({ top: 0, right: undefined as number | undefined, left: undefined as number | undefined });

  const updatePosition = () => {
    if (!filterButtonRef?.current) return;
    const buttonRect = filterButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const isSmallScreen = viewportWidth < 640; // sm breakpoint
    const modalWidth = isSmallScreen ? viewportWidth - 32 : 448; // 28rem = 448px

    // Calculate right position (align right edge with button)
    const rightPos = viewportWidth - buttonRect.right;

    // Calculate if modal would overflow left edge
    const leftPos = viewportWidth - rightPos - modalWidth;
    const minLeft = 16; // 1rem minimum margin

    // If modal would overflow left, use left positioning instead
    if (leftPos < minLeft) {
      setModalPosition({
        top: buttonRect.bottom + 8,
        right: undefined,
        left: minLeft,
      });
    } else {
      setModalPosition({
        top: buttonRect.bottom + 8,
        right: rightPos,
        left: undefined,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    // Keep the popover "attached" to the button while the page scrolls/resizes.
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updatePosition);
    };

    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [isOpen, filterButtonRef]);

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
      ...filters,
      excludePremium: !filters.excludePremium,
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
    });
  };

  const filteredTags = TAGS.filter((tag) =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const hasActiveFilters =
    (filters.difficulty && filters.difficulty.length > 0) ||
    filters.excludePremium ||
    filters.includeTags.length > 0;

  const allDifficulties = ["Easy", "Medium", "Hard"];
  const allSelected = allDifficulties.every(d => filters.difficulty?.includes(d));

  return (
    <>
      {/* Invisible overlay to close on click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Modal positioned directly below filter button, aligned to right edge */}
      <div
        className={cn(
          "fixed z-50",
          "w-[calc(100vw-2rem)] sm:w-[28rem] max-w-lg",
          "max-h-[65vh] overflow-hidden",
          "rounded-2xl",
          "border border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl",
          "shadow-[0_30px_90px_rgba(0,0,0,0.75)]"
        )}
        style={{
          top: `${modalPosition.top}px`,
          right: modalPosition.right !== undefined ? `${modalPosition.right}px` : undefined,
          left: modalPosition.left !== undefined ? `${modalPosition.left}px` : undefined,
        }}
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
                      : filters.difficulty?.includes(difficulty) || false;

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
            <section className="rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Exclude premium
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600 dark:text-white/50">
                    Hide problems that require LeetCode Premium.
                  </div>
                </div>
                <Switch
                  checked={filters.excludePremium}
                  onChange={handlePremiumToggle}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-black",
                    filters.excludePremium ? "bg-black/70 dark:bg-white/25" : "bg-black/10 dark:bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full transition-transform",
                      "bg-white dark:bg-black",
                      filters.excludePremium ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </Switch>
              </div>
            </section>

            {/* Tags */}
            <section>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60">
                  Include tags
                </h3>
                <div className="text-xs text-white/40">
                  {filters.includeTags.length} selected
                </div>
              </div>

              {filters.includeTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filters.includeTags.map((tag) => (
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
                        const isIncluded = filters.includeTags.includes(tag);
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
    </>
  );
}

