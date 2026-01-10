"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ListProblem } from "../components/ListDetailView/types";

/**
 * Input type for adding a problem with full metadata (for optimistic updates)
 */
export type AddProblemInput = {
  qid: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  isPremium: boolean;
};

/**
 * Hook for fetching and managing problems in a list.
 *
 * Uses React Query for:
 * - Caching problems per list (no refetch when switching back to same list)
 * - Auto-invalidation when problems are added/removed
 * - Also updates the parent "lists" cache when problem count changes
 * - OPTIMISTIC UPDATES for instant UI feedback
 */
export function useListProblems(listId: string) {
  const queryClient = useQueryClient();

  // ============================================
  // QUERY: Fetch problems for this list
  // ============================================
  const problemsQuery = useQuery({
    queryKey: ["list-problems", listId], // Cache key includes listId
    queryFn: async () => {
      const response = await axios.get<{ problems: ListProblem[] }>(
        `/api/py/lists/${listId}/problems`
      );
      return response.data.problems;
    },
    enabled: !!listId, // Only fetch if listId is provided
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
  });

  // ============================================
  // MUTATION: Add a problem to the list (OPTIMISTIC)
  // ============================================
  const addMutation = useMutation({
    mutationFn: async (input: AddProblemInput) => {
      // Only send qid to the API
      const response = await axios.post(`/api/py/lists/${listId}/problems`, {
        problem_qid: input.qid,
      });
      return response.data;
    },

    // OPTIMISTIC: Run BEFORE the API call completes
    onMutate: async (input) => {
      // 1. Cancel any in-flight fetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["list-problems", listId] });

      // 2. Snapshot current state (for rollback if error)
      const previousProblems = queryClient.getQueryData<ListProblem[]>([
        "list-problems",
        listId,
      ]);

      // 3. Optimistically add the problem to cache with full data
      queryClient.setQueryData<ListProblem[]>(
        ["list-problems", listId],
        (old) => [
          ...(old ?? []),
          {
            id: `temp-${input.qid}`, // Temporary ID until server responds
            list_id: listId,
            problem_qid: input.qid,
            position: old?.length ?? 0,
            added_at: new Date().toISOString(),
            title: input.title,
            difficulty: input.difficulty,
            tags: input.tags,
            is_premium: input.isPremium,
          },
        ]
      );

      // 4. Also optimistically update problem count in sidebar
      queryClient.setQueryData(
        ["lists"],
        (old: { id: string; problem_count: number }[] | undefined) =>
          old?.map((list) =>
            list.id === listId
              ? { ...list, problem_count: list.problem_count + 1 }
              : list
          )
      );

      // 5. Return context for potential rollback
      return { previousProblems };
    },

    // ROLLBACK: If API call fails, restore previous state
    onError: (err, input, context) => {
      if (context?.previousProblems) {
        queryClient.setQueryData(
          ["list-problems", listId],
          context.previousProblems
        );
      }
      // Also refetch lists to restore correct count
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },

    // SETTLE: Always refetch to ensure we're in sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["list-problems", listId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  // ============================================
  // MUTATION: Remove a problem from the list (OPTIMISTIC)
  // ============================================
  const removeMutation = useMutation({
    mutationFn: async (problemQid: number) => {
      await axios.delete(`/api/py/lists/${listId}/problems/${problemQid}`);
      return problemQid;
    },

    // OPTIMISTIC: Run BEFORE the API call completes
    onMutate: async (problemQid) => {
      // 1. Cancel any in-flight fetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["list-problems", listId] });

      // 2. Snapshot current state (for rollback if error)
      const previousProblems = queryClient.getQueryData<ListProblem[]>([
        "list-problems",
        listId,
      ]);

      // 3. Optimistically remove the problem from cache
      queryClient.setQueryData<ListProblem[]>(
        ["list-problems", listId],
        (old) => old?.filter((p) => p.problem_qid !== problemQid) ?? []
      );

      // 4. Also optimistically update problem count in sidebar
      queryClient.setQueryData(["lists"], (old: { id: string; problem_count: number }[] | undefined) =>
        old?.map((list) =>
          list.id === listId
            ? { ...list, problem_count: Math.max(0, list.problem_count - 1) }
            : list
        )
      );

      // 5. Return context for potential rollback
      return { previousProblems };
    },

    // ROLLBACK: If API call fails, restore previous state
    onError: (err, problemQid, context) => {
      if (context?.previousProblems) {
        queryClient.setQueryData(
          ["list-problems", listId],
          context.previousProblems
        );
      }
      // Also refetch lists to restore correct count
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },

    // SETTLE: Always refetch to ensure we're in sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["list-problems", listId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  // ============================================
  // Helper: Check if a problem is in the list
  // ============================================
  const isProblemInList = (qid: number) =>
    problemsQuery.data?.some((p) => p.problem_qid === qid) ?? false;

  // ============================================
  // Return values (similar interface to before)
  // ============================================
  return {
    // Data
    problems: problemsQuery.data ?? [],

    // Loading states
    isLoading: problemsQuery.isLoading,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,

    // Error handling
    error: problemsQuery.error
      ? "Failed to load problems. Please try again."
      : addMutation.error
        ? "Failed to add problem. Please try again."
        : removeMutation.error
          ? "Failed to remove problem. Please try again."
          : null,

    // For manual error clearing (if needed by UI)
    clearError: () => {
      addMutation.reset();
      removeMutation.reset();
    },

    // Actions
    addProblem: async (input: AddProblemInput) => {
      // Check if already in list before calling API
      if (isProblemInList(input.qid)) {
        return false;
      }
      try {
        await addMutation.mutateAsync(input);
        return true;
      } catch {
        return false;
      }
    },
    removeProblem: async (problemQid: number) => {
      try {
        await removeMutation.mutateAsync(problemQid);
        return true;
      } catch {
        return false;
      }
    },

    // Utilities
    isProblemInList,
    refetch: problemsQuery.refetch,
  };
}
