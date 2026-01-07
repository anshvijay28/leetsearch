"use client";

import { Question } from "../types";
import QuestionCard from "./QuestionCard";

type ResultsListProps = {
  results: Question[];
  isLoading?: boolean;
};

export default function ResultsList({
  results,
  isLoading = false,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-cyan-400 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-zinc-400 text-sm">Searching for questions...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          Results
        </div>
        <div className="text-[11px] text-zinc-500">
          {results.length}{" "}
          {results.length === 1 ? "match" : "matches"}
        </div>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto overflow-x-hidden pr-1 scrollbar-hide">
        {results.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
          />
        ))}
      </div>
    </>
  );
}

