"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";

export type FilterOptions = {
  difficulty: string[]; // Array of selected difficulties
  excludePremium: boolean;
  includeTags: string[]; // Array of tags to include (questions must have at least one of these)
};

type FilterPanelProps = {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
};

// Common LeetCode tags - this could be fetched from an API in the future
const COMMON_TAGS = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Binary Search",
  "Breadth-First Search",
  "Tree",
  "Matrix",
  "Two Pointers",
  "Bit Manipulation",
  "Binary Tree",
  "Heap (Priority Queue)",
  "Stack",
  "Graph",
  "Prefix Sum",
  "Simulation",
  "Design",
  "Counting",
  "Backtracking",
  "Sliding Window",
  "Union Find",
  "Linked List",
  "Ordered Set",
  "Monotonic Stack",
  "Enumeration",
  "Recursion",
  "Trie",
  "Divide and Conquer",
  "Binary Search Tree",
  "Queue",
  "Memoization",
  "Geometry",
  "Topological Sort",
  "Number Theory",
  "Game Theory",
  "Shortest Path",
  "Interactive",
  "String Matching",
  "Rolling Hash",
  "Hash Function",
  "Iterator",
  "Randomized",
  "Probability and Statistics",
  "Rejection Sampling",
  "Reservoir Sampling",
  "Monotonic Queue",
  "Brainteaser",
  "Combinatorics",
  "Concurrency",
];

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

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
      ? filters.includeTags.filter((t: string) => t !== tag)
      : [...filters.includeTags, tag];
    
    onFiltersChange({
      ...filters,
      includeTags: newIncludeTags,
    });
  };

  const filteredTags = COMMON_TAGS.filter((tag) =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const hasActiveFilters =
    (filters.difficulty && filters.difficulty.length > 0) ||
    filters.excludePremium ||
    filters.includeTags.length > 0;
  
  const allDifficulties = ["Easy", "Medium", "Hard"];
  const allSelected = allDifficulties.every(d => filters.difficulty?.includes(d));

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-black/50 border border-[#06b6d4]/20 hover:border-[#06b6d4]/40 hover:bg-gradient-to-r hover:from-[#0f1f35] hover:via-[#15243a] hover:to-[#0f1f35] transition-all"
      >
        <div className="flex items-center gap-2">
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
          <span className="text-sm font-semibold text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
              Active
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-zinc-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 rounded-lg bg-black/50 border border-[#06b6d4]/20 space-y-6">
          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
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
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Include Tags
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Only show questions that have at least one of the selected tags
            </p>
            <input
              type="text"
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              placeholder="Search tags to include..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700/50 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 mb-3"
            />
            <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-1">
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
            {filters.includeTags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-700/50">
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
          </div>
        </div>
      )}
    </div>
  );
}

