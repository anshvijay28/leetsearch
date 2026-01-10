"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Type definition (same as in page.tsx)
export type List = {
  id: string;
  name: string;
  description?: string;
  problem_count: number;
};

/**
 * Hook for fetching and mutating user's lists.
 * 
 * Uses React Query for:
 * - Automatic caching (no refetch on navigation)
 * - Background refetching when stale
 * - Shared cache across components
 */
export function useLists() {
  const queryClient = useQueryClient();

  // ============================================
  // QUERY: Fetch all lists
  // ============================================
  const listsQuery = useQuery({
    queryKey: ["lists"],  // Cache key - unique identifier for this data
    queryFn: async () => {
      // Same axios call you had before
      const response = await axios.get<List[]>("/api/py/lists");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // ============================================
  // MUTATION: Create a new list
  // ============================================
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await axios.post<List>("/api/py/lists", {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      // After successful create, tell React Query to refetch lists
      // This is the simple approach - just invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  // ============================================
  // MUTATION: Delete a list
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: async (listId: string) => {
      await axios.delete(`/api/py/lists/${listId}`);
      return listId;
    },
    onSuccess: () => {
      // After successful delete, refetch lists
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  // ============================================
  // Return values (similar interface to before)
  // ============================================
  return {
    // Data
    lists: listsQuery.data ?? [],
    
    // Loading states
    isLoading: listsQuery.isLoading,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Errors
    error: listsQuery.error 
      ? "Failed to load lists. Please try again."
      : createMutation.error
        ? "Failed to create list. Please try again."
        : deleteMutation.error
          ? "Failed to delete list. Please try again."
          : null,
    
    // Actions
    createList: createMutation.mutateAsync,
    deleteList: deleteMutation.mutateAsync,
    
    // Manual refetch (rarely needed, but available)
    refetch: listsQuery.refetch,
  };
}

