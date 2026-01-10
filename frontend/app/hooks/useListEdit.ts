"use client";

import { useState } from "react";
import axios from "axios";

export function useListEdit(
  listId: string,
  initialName: string,
  initialDescription: string = "",
  onSaved?: () => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const [editDescription, setEditDescription] = useState(initialDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setEditName(initialName);
    setEditDescription(initialDescription);
    setIsEditing(true);
    setError(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName(initialName);
    setEditDescription(initialDescription);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      setError("List name is required");
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      await axios.put(`/api/py/lists/${listId}`, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      setIsEditing(false);
      onSaved?.();
      return true;
    } catch (err) {
      console.error("Failed to update list:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Failed to update list");
      } else {
        setError("Failed to update list. Please try again.");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    editName,
    editDescription,
    isSaving,
    error,
    setEditName,
    setEditDescription,
    startEditing,
    cancelEditing,
    saveEdit,
  };
}

