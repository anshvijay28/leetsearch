"use client";

import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { Question } from "../types";

type ListProblem = {
  id: string;
  list_id: string;
  problem_qid: number;
  position: number;
  added_at: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  is_premium: boolean;
};

type ListDetailViewProps = {
  listId: string;
  listName: string;
  onDeleteList: () => void;
  onListUpdated?: () => void;
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

export default function ListDetailView({
  listId,
  listName,
  onDeleteList,
  onListUpdated,
}: ListDetailViewProps) {
  // State for list problems (left panel)
  const [problems, setProblems] = useState<ListProblem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [browseMode, setBrowseMode] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Fetch list problems when listId changes
  useEffect(() => {
    if (listId) {
      fetchListProblems();
      setSearchQuery("");
      setSearchResults([]);
      setBrowseMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

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

  const fetchListProblems = async () => {
    setIsLoadingProblems(true);
    setError(null);

    try {
      const response = await axios.get<{ problems: ListProblem[] }>(
        `/api/py/lists/${listId}/problems`
      );
      setProblems(response.data.problems);
      if (onListUpdated) {
        onListUpdated();
      }
    } catch (err) {
      console.error("Failed to fetch list problems:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Please log in to view list problems");
      } else {
        setError("Failed to load problems. Please try again.");
      }
    } finally {
      setIsLoadingProblems(false);
    }
  };

  const handleAddProblem = async (problemQid: number) => {
    if (problems.some((p) => p.problem_qid === problemQid)) {
      setError("Problem already in list");
      return;
    }

    setError(null);

    try {
      await axios.post(`/api/py/lists/${listId}/problems`, {
        problem_qid: problemQid,
      });
      await fetchListProblems();
    } catch (err) {
      console.error("Failed to add problem:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError(err.response.data?.detail || "Failed to add problem");
        } else if (err.response?.status === 401) {
          setError("Please log in to add problems");
        } else {
          setError("Failed to add problem. Please try again.");
        }
      } else {
        setError("Failed to add problem. Please try again.");
      }
    }
  };

  const handleRemoveProblem = async (problemQid: number) => {
    setError(null);

    try {
      await axios.delete(`/api/py/lists/${listId}/problems/${problemQid}`);
      await fetchListProblems();
    } catch (err) {
      console.error("Failed to remove problem:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Please log in to remove problems");
        } else {
          setError("Failed to remove problem. Please try again.");
        }
      } else {
        setError("Failed to remove problem. Please try again.");
      }
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const handleConfirmDelete = () => {
    onDeleteList();
    setShowDeleteConfirm(false);
  };

  const isProblemInList = (qid: number) => problems.some((p) => p.problem_qid === qid);

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

  // Calculate stats
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-white mb-2">{listName}</h1>
            <p className="text-sm text-zinc-400">{problems.length} questions</p>
          </div>
          <div className="flex items-center gap-3">
            {showDeleteConfirm ? (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
                >
                  Confirm Delete
                </button>
              </>
            ) : (
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-sm font-semibold transition-colors"
              >
                Delete List
              </button>
            )}
          </div>
        </div>

        {/* Progress Stats */}
        {problems.length > 0 && (
          <div className="flex items-center gap-6">
            <div className="text-sm text-zinc-400">
              <span className="text-green-400">Easy:</span> {easyCount}
            </div>
            <div className="text-sm text-zinc-400">
              <span className="text-yellow-400">Medium:</span> {mediumCount}
            </div>
            <div className="text-sm text-zinc-400">
              <span className="text-rose-400">Hard:</span> {hardCount}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Half - Problems in List */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-800 pr-4">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-zinc-300">Problems</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingProblems && problems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#06b6d4]">Loading problems...</p>
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400">
                  No problems in this list yet. Search and add problems from the right panel!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-4 bg-black/30 border border-zinc-800 rounded-lg hover:bg-black/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-semibold text-[#06b6d4] min-w-[50px]">
                          {problem.problem_qid}.
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <a
                              href={`https://lcid.cc/${problem.problem_qid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-white hover:text-[#06b6d4] transition-colors"
                            >
                              {problem.title}
                            </a>
                            {problem.is_premium && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Premium
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                problem.difficulty === "Easy"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : problem.difficulty === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {problem.tags.slice(0, 3).join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProblem(problem.problem_qid)}
                      className="ml-4 p-2 text-zinc-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from list"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Half - Browse/Search Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <h3 className="text-lg font-semibold text-zinc-300 mb-4 flex-shrink-0">
            {browseMode ? "Browse Problems" : "Search Results"}
          </h3>

          {/* Search Bar */}
          <div className="mb-4 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError(null);
              }}
              placeholder="Search by name or QID (e.g., 'Two Sum' or '1')..."
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#06b6d4]/40 transition-colors"
            />

            {/* Error Message */}
            {(error || queryError) && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm">
                {error || (queryError as Error)?.message}
              </div>
            )}
          </div>

          {/* Browse Mode or Search Results */}
          <div className="flex-1 overflow-y-auto">
            {browseMode ? (
              // Browse Mode: Infinite scroll with React Query
              <>
                {status === "pending" ? (
                  <div className="text-center py-12">
                    <p className="text-[#06b6d4]">Loading problems...</p>
                  </div>
                ) : status === "error" ? (
                  <div className="text-center py-12">
                    <p className="text-rose-400">Failed to load problems</p>
                  </div>
                ) : allBrowseProblems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-400">No problems available.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {allBrowseProblems.map((question, index) => (
                      <div
                        key={`${question.qid}-${index}`}
                        className="flex items-center justify-between p-4 bg-black/30 border border-zinc-800 rounded-lg hover:bg-black/50 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-[#06b6d4] min-w-[50px]">
                              {question.qid}.
                            </span>
                            <span className="text-sm text-white">{question.title}</span>
                            {question.is_premium && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Premium
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-[58px]">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                question.difficulty === "Easy"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : question.difficulty === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {question.difficulty}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {question.tags.slice(0, 3).join(", ")}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddProblem(question.qid)}
                          disabled={isProblemInList(question.qid)}
                          className="ml-4 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProblemInList(question.qid) ? "Added" : "Add"}
                        </button>
                      </div>
                    ))}

                    {/* Sentinel div for infinite scroll */}
                    <div ref={bottomRef} className="py-4 text-center">
                      {isFetchingNextPage ? (
                        <p className="text-[#06b6d4]">Loading more...</p>
                      ) : hasNextPage ? (
                        <p className="text-zinc-500">Scroll for more</p>
                      ) : (
                        <p className="text-zinc-500">No more problems</p>
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
                    <p className="text-[#06b6d4]">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((question) => (
                      <div
                        key={question.qid}
                        className="flex items-center justify-between p-4 bg-black/30 border border-zinc-800 rounded-lg hover:bg-black/50 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-[#06b6d4] min-w-[50px]">
                              {question.qid}.
                            </span>
                            <span className="text-sm text-white">{question.title}</span>
                            {question.is_premium && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Premium
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-[58px]">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                question.difficulty === "Easy"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : question.difficulty === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {question.difficulty}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {question.tags.slice(0, 3).join(", ")}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddProblem(question.qid)}
                          disabled={isProblemInList(question.qid)}
                          className="ml-4 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProblemInList(question.qid) ? "Added" : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-400">
                      No results found. Try a different search query.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
