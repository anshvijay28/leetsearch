"use client";

import { ProblemPillProps } from "./types";
import { cn } from "@/lib/utils";

export default function ProblemPill({
  qid,
  title,
  difficulty,
  isPremium,
  slug,
  isInList = false,
  onAdd,
  onRemove,
  onFindSimilar,
}: ProblemPillProps) {
  const difficultyStyles = {
    Easy: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    Medium: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
    },
    Hard: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-600 dark:text-rose-400",
    },
  };

  const difficultyStyle = difficultyStyles[difficulty] || difficultyStyles.Medium;
  const problemUrl = slug ? `https://leetcode.com/problems/${slug}` : `https://lcid.cc/${qid}`;

  return (
    <div className={cn(
      "group flex items-center gap-2 p-2 rounded-xl transition-all",
      "border border-gray-200/80 dark:border-white/10 bg-white dark:bg-black",
      "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-none",
      "hover:shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]"
    )}>
      <a
        href={problemUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center flex-1 min-w-0 gap-3"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{qid}</span>
        </div>

        <div className="flex items-center flex-1 min-w-0 gap-2">
          <span className="text-sm text-gray-900 dark:text-white truncate font-medium">
            {title}
          </span>
          {isPremium && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0 font-medium">
              Premium
            </span>
          )}
        </div>

        <span
          className={cn(
            "text-xs px-2.5 py-1 rounded-lg flex-shrink-0 font-medium",
            difficultyStyle.bg,
            difficultyStyle.text
          )}
        >
          {difficulty}
        </span>
      </a>

      {/* Find Similar Button */}
      {onFindSimilar && (
        <button
          onClick={onFindSimilar}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex-shrink-0"
          title="Find similar problems"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      )}

      {/* Action Button */}
      {onAdd && (
        <button
          onClick={onAdd}
          disabled={isInList}
          className="h-9 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 dark:hover:bg-white/90 flex-shrink-0"
        >
          {isInList ? "Added" : "Add"}
        </button>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex-shrink-0"
          title="Remove from list"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

