"use client";

import { ProblemPillProps } from "./types";

export default function ProblemPill({
  qid,
  title,
  difficulty,
  isPremium,
  isInList = false,
  showLink = false,
  onAdd,
  onRemove,
}: ProblemPillProps) {
  const difficultyStyles = {
    Easy: "bg-green-500/20 text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    Hard: "bg-rose-500/20 text-rose-400",
  };

  return (
    <div className="flex items-center h-12 px-1 bg-black/30 border border-zinc-800 rounded-full hover:bg-black/50 transition-colors group">
      {/* QID Badge */}
      <div className="w-12 h-10 flex items-center justify-center bg-[#06b6d4]/20 rounded-full ml-0.5">
        <span className="text-lg font-bold text-[#06b6d4]">{qid}</span>
      </div>

      {/* Title */}
      <div className="flex items-center flex-1 px-3 min-w-0">
        {showLink ? (
          <a
            href={`https://lcid.cc/${qid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white hover:text-[#06b6d4] transition-colors truncate"
          >
            {title}
          </a>
        ) : (
          <span className="text-sm text-white truncate">{title}</span>
        )}
        {isPremium && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex-shrink-0">
            Premium
          </span>
        )}
      </div>

      {/* Difficulty Badge */}
      <span
        className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${difficultyStyles[difficulty]}`}
      >
        {difficulty}
      </span>

      {/* Action Button */}
      {onAdd && (
        <button
          onClick={onAdd}
          disabled={isInList}
          className="h-10 px-4 mx-1 rounded-full bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInList ? "Added" : "Add"}
        </button>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 mr-0.5"
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

