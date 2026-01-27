"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { Question } from "../../types";
import ProblemPill from "./ProblemPill";
import { type AddProblemInput } from "../../hooks/useListProblems";

type BrowsePanelProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Question[];
  isSearching: boolean;
  browseMode: boolean;
  error: string | null;
  onClearError: () => void;
  isProblemInList: (qid: number) => boolean;
  onAddProblem: (input: AddProblemInput) => void;
  similarQid: number | null;
  similarTitle: string;
  similarResults: Question[];
  isLoadingSimilar: boolean;
  onClearSimilar: () => void;
};

// API function for fetching paginated problems (cursor-based)
const fetchProblemsPage = async (cursor: number | null) => {
  const params: { limit: number; cursor?: number } = { limit: 15 };
  if (cursor !== null) {
    params.cursor = cursor;
  }
  const response = await axios.get<{
    problems: Question[];
    nextPage: number | null;
  }>("/api/py/problems", { params });
  return response.data;
};

export default function BrowsePanel({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  browseMode,
  error,
  onClearError,
  isProblemInList,
  onAddProblem,
  similarQid,
  similarTitle,
  similarResults,
  isLoadingSimilar,
  onClearSimilar,
}: BrowsePanelProps) {
  const similarMode = similarQid !== null;
  // Intersection observer for infinite scroll
  const { ref: bottomRef, inView } = useInView();

  // React Query for infinite scroll (cursor-based pagination)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error: queryError,
  } = useInfiniteQuery({
    queryKey: ["problems"],
    queryFn: ({ pageParam }) => fetchProblemsPage(pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: browseMode,
  });

  // Fetch next page when bottom sentinel is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into single array and deduplicate by QID
  const allBrowseProblems = (() => {
    const allProblems = data?.pages.flatMap((page) => page.problems) ?? [];
    const seen = new Set<number>();
    return allProblems.filter((problem) => {
      if (seen.has(problem.qid)) {
        return false;
      }
      seen.add(problem.qid);
      return true;
    });
  })();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {similarMode ? (
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onClearSimilar}
              className="flex items-center gap-1 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Browse
            </button>
          </div>
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-white/60 mb-1">
            Similar to
          </h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {similarTitle}
          </p>
          <p className="text-sm text-gray-600 dark:text-white/60">
            Problems with similar concepts and patterns
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-white/60 mb-4 flex-shrink-0">
            {browseMode ? "Browse Problems" : "Search Results"}
          </h3>

          <div className="mb-4 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onClearError();
              }}
              placeholder="Search by name or QID (e.g., 'Two Sum' or '1')..."
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:focus:border-white/20 dark:focus:ring-white/10"
            />

            {(error || queryError) && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-sm">
                {error || (queryError as Error)?.message}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex-1 overflow-y-auto">
        {similarMode ? (
          <>
            {isLoadingSimilar ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-white/70">Finding similar problems...</p>
              </div>
            ) : similarResults.length > 0 ? (
              <div className="space-y-2">
                {similarResults.map((question) => (
                  <ProblemPill
                    key={question.qid}
                    qid={question.qid}
                    title={question.title}
                    difficulty={question.difficulty}
                    isPremium={question.is_premium}
                    isInList={isProblemInList(question.qid)}
                    onAdd={() =>
                      onAddProblem({
                        qid: question.qid,
                        title: question.title,
                        difficulty: question.difficulty,
                        tags: question.tags,
                        isPremium: question.is_premium,
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-white/60">
                  No similar problems found.
                </p>
              </div>
            )}
          </>
        ) : browseMode ? (
          // Browse Mode: Infinite scroll with React Query
          <>
            {status === "pending" ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-white/70">Loading problems...</p>
              </div>
            ) : status === "error" ? (
              <div className="text-center py-12">
                <p className="text-sm text-rose-500 dark:text-rose-400">Failed to load problems</p>
              </div>
            ) : allBrowseProblems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-white/60">No problems available.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allBrowseProblems.map((question, index) => (
                  <ProblemPill
                    key={`${question.qid}-${index}`}
                    qid={question.qid}
                    title={question.title}
                    difficulty={question.difficulty}
                    isPremium={question.is_premium}
                    isInList={isProblemInList(question.qid)}
                    onAdd={() =>
                      onAddProblem({
                        qid: question.qid,
                        title: question.title,
                        difficulty: question.difficulty,
                        tags: question.tags,
                        isPremium: question.is_premium,
                      })
                    }
                  />
                ))}

                {/* Sentinel div for infinite scroll */}
                <div ref={bottomRef} className="py-4 text-center">
                  {isFetchingNextPage ? (
                    <p className="text-sm text-gray-600 dark:text-white/70">Loading more...</p>
                  ) : hasNextPage ? (
                    <p className="text-sm text-gray-500 dark:text-white/50">Scroll for more</p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-white/50">No more problems</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          // Search Mode
          <>
            {isSearching ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-white/70">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((question) => (
                  <ProblemPill
                    key={question.qid}
                    qid={question.qid}
                    title={question.title}
                    difficulty={question.difficulty}
                    isPremium={question.is_premium}
                    isInList={isProblemInList(question.qid)}
                    onAdd={() =>
                      onAddProblem({
                        qid: question.qid,
                        title: question.title,
                        difficulty: question.difficulty,
                        tags: question.tags,
                        isPremium: question.is_premium,
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-white/60">
                  No results found. Try a different search query.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

