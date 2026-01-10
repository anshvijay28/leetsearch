"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { ListProblem } from "../components/ListDetailView/types";

export function useListProblems(listId: string, onListUpdated?: () => void) {
  const [problems, setProblems] = useState<ListProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to avoid callback in dependencies (prevents infinite loop)
  const onListUpdatedRef = useRef(onListUpdated);
  useEffect(() => {
    onListUpdatedRef.current = onListUpdated;
  }, [onListUpdated]);

  const fetchProblems = useCallback(async (notifyParent = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<{ problems: ListProblem[] }>(
        `/api/py/lists/${listId}/problems`
      );
      setProblems(response.data.problems);
      // Only notify parent after mutations, not on initial load
      if (notifyParent) {
        onListUpdatedRef.current?.();
      }
    } catch (err) {
      console.error("Failed to fetch list problems:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Please log in to view list problems");
      } else {
        setError("Failed to load problems. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const addProblem = async (problemQid: number) => {
    if (problems.some((p) => p.problem_qid === problemQid)) {
      setError("Problem already in list");
      return false;
    }

    setError(null);

    try {
      await axios.post(`/api/py/lists/${listId}/problems`, {
        problem_qid: problemQid,
      });
      await fetchProblems(true); // Notify parent after mutation
      return true;
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
      return false;
    }
  };

  const removeProblem = async (problemQid: number) => {
    setError(null);

    try {
      await axios.delete(`/api/py/lists/${listId}/problems/${problemQid}`);
      await fetchProblems(true); // Notify parent after mutation
      return true;
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
      return false;
    }
  };

  const isProblemInList = (qid: number) => problems.some((p) => p.problem_qid === qid);

  // Fetch problems when listId changes
  useEffect(() => {
    if (listId) {
      fetchProblems(false); // Don't notify parent on initial load
    }
  }, [listId, fetchProblems]);

  return {
    problems,
    isLoading,
    error,
    setError,
    addProblem,
    removeProblem,
    isProblemInList,
    refetch: fetchProblems,
  };
}

