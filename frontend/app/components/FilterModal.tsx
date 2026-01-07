"use client";

import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { FilterOptions } from "./FilterPanel";

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
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && filterButtonRef?.current) {
      const buttonRect = filterButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: buttonRect.bottom + 8, // 8px gap below button
        right: window.innerWidth - buttonRect.right, // Align right edge with button
      });
    }
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
        className="fixed z-50 bg-[#050507] border border-[#2a2a2f] max-w-lg w-[calc(100vw-2rem)] sm:w-[28rem] max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide shadow-2xl rounded-xl overflow-hidden"
        style={{
          top: `${modalPosition.top}px`,
          right: `${modalPosition.right}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#2a2a2f] sticky top-0 bg-[#050507] z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Filters</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {["All", "Easy", "Medium", "Hard"].map((difficulty) => {
                const isSelected = difficulty === "All" 
                  ? allSelected 
                  : filters.difficulty?.includes(difficulty) || false;
                
                return (
                  <button
                    key={difficulty}
                    onClick={() => handleDifficultyChange(difficulty)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      isSelected
                        ? difficulty === "Easy"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : difficulty === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : difficulty === "Hard"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:border-zinc-600"
                    }`}
                  >
                    {difficulty}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premium Filter */}
          <div>
            <div className="flex items-center gap-3">
              <Switch
                checked={filters.excludePremium}
                onChange={handlePremiumToggle}
                className={`${
                  filters.excludePremium ? "bg-cyan-500" : "bg-zinc-700"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black`}
              >
                <span
                  className={`${
                    filters.excludePremium ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <div>
                <span className="text-sm font-semibold text-zinc-300">
                  Exclude Premium Problems
                </span>
                <p className="text-xs text-zinc-500">
                  Hide problems that require a LeetCode Premium subscription
                </p>
              </div>
            </div>
          </div>

          {/* Tag Inclusion Filter */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">
              Include Tags
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Only show questions that have at least one of the selected tags
            </p>
            {filters.includeTags.length > 0 && (
              <div className="mb-3 pb-3 border-b border-zinc-700/50">
                <div className="flex flex-wrap gap-2">
                  {filters.includeTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="hover:text-cyan-200 cursor-pointer"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <input
              type="text"
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              placeholder="Search tags to include..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700/50 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 mb-3"
            />
            <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1 border border-zinc-700/30 rounded-lg p-2 bg-zinc-900/20">
              {filteredTags.length === 0 ? (
                <p className="text-sm text-zinc-500 py-2">No tags found</p>
              ) : (
                filteredTags.map((tag) => {
                  const isIncluded = filters.includeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        isIncluded
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-zinc-800/50 text-zinc-300 border border-transparent hover:border-zinc-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tag}</span>
                        {isIncluded && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#2a2a2f] flex items-center justify-between gap-3 sticky bottom-0 bg-[#050507]">
          <button
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              hasActiveFilters
                ? "text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                : "text-zinc-600 cursor-not-allowed"
            }`}
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

