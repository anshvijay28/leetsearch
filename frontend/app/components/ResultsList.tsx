"use client";

import { Question } from "../types";
import QuestionCard from "./QuestionCard";

type ResultsListProps = {
  results: Question[];
};

export default function ResultsList({
  results,
}: ResultsListProps) {
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

      <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto overflow-x-hidden pr-1">
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

