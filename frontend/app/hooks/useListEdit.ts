"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 * Hook for editing a list's name and description.
 *
 * Combines local UI state (for the edit form) with React Query mutation
 * for the actual save operation.
 */
export function useListEdit(
  listId: string,
  initialName: string,
  initialDescription: string = ""
) {
  const queryClient = useQueryClient();

  // ============================================
  // LOCAL STATE: Edit form UI
  // ============================================
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const [editDescription, setEditDescription] = useState(initialDescription);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ============================================
  // MUTATION: Save the edit (OPTIMISTIC)
  // ============================================
  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; description: string | null }) => {
      const response = await axios.put(`/api/py/lists/${listId}`, data);
      return response.data;
    },

    // OPTIMISTIC: Update cache immediately before API call completes
    onMutate: async (data) => {
      // Cancel any in-flight fetches
      await queryClient.cancelQueries({ queryKey: ["lists"] });

      // Snapshot current state for rollback
      const previousLists = queryClient.getQueryData<
        { id: string; name: string; description?: string; problem_count: number }[]
      >(["lists"]);

      // Optimistically update the list in cache
      queryClient.setQueryData(
        ["lists"],
        (old: { id: string; name: string; description?: string; problem_count: number }[] | undefined) =>
          old?.map((list) =>
            list.id === listId
              ? { ...list, name: data.name, description: data.description ?? undefined }
              : list
          )
      );

      // Close edit mode immediately (feels instant!)
      setIsEditing(false);
      setValidationError(null);

      return { previousLists };
    },

    // ROLLBACK: If API call fails, restore previous state
    onError: (err, data, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(["lists"], context.previousLists);
      }
      // Re-open edit mode so user can try again
      setIsEditing(true);
    },

    // SETTLE: Always refetch to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  // ============================================
  // UI Actions
  // ============================================
  const startEditing = () => {
    setEditName(initialName);
    setEditDescription(initialDescription);
    setIsEditing(true);
    setValidationError(null);
    saveMutation.reset(); // Clear any previous errors
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName(initialName);
    setEditDescription(initialDescription);
    setValidationError(null);
    saveMutation.reset();
  };

  const saveEdit = async () => {
    // Client-side validation
    if (!editName.trim()) {
      setValidationError("List name is required");
      return false;
    }

    setValidationError(null);

    try {
      await saveMutation.mutateAsync({
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      return true;
    } catch {
      return false;
    }
  };

  // ============================================
  // Return values (same interface as before)
  // ============================================
  return {
    // Edit form state
    isEditing,
    editName,
    editDescription,
    setEditName,
    setEditDescription,

    // Loading & errors
    isSaving: saveMutation.isPending,
    error: validationError || 
      (saveMutation.error ? "Failed to update list. Please try again." : null),

    // Actions
    startEditing,
    cancelEditing,
    saveEdit,
  };
}
