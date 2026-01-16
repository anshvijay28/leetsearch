"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Question } from "../types";

const fetchSimilarProblems = async (qid: number): Promise<Question[]> => {
  const response = await axios.get<Question[]>(
    `/api/py/problems/${qid}/similar`,
    { params: { limit: 15 } }
  );
  return response.data;
};

export function useSimilarProblems() {
  const [similarQid, setSimilarQid] = useState<number | null>(null);
  const [similarTitle, setSimilarTitle] = useState<string>("");

  const {
    data: similarResults = [],
    isLoading: isLoadingSimilar,
    error: queryError,
  } = useQuery({
    queryKey: ["similar-problems", similarQid],
    queryFn: () => fetchSimilarProblems(similarQid!),
    enabled: similarQid !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const findSimilar = (qid: number, title: string) => {
    setSimilarQid(qid);
    setSimilarTitle(title);
  };

  const clearSimilar = () => {
    setSimilarQid(null);
    setSimilarTitle("");
  };

  const error = queryError ? "Failed to fetch similar problems. Please try again." : null;

  return {
    similarQid,
    similarTitle,
    similarResults,
    isLoadingSimilar,
    error,
    setError: (_: string | null) => {},
    findSimilar,
    clearSimilar,
  };
}
