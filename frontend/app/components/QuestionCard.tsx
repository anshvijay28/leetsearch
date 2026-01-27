"use client";

import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Question } from "../types";
import AddToListDropdown from "./AddToListDropdown";
import { cn } from "@/lib/utils";

type QuestionCardProps = {
  question: Question;
  colSpan?: number;
  hasPersistentHover?: boolean;
};

const getDifficultyColors = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        hover: "group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30",
      };
    case "Medium":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        hover: "group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/30",
      };
    case "Hard":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        hover: "group-hover:bg-rose-500/20 dark:group-hover:bg-rose-500/30",
      };
    default:
      return {
        bg: "bg-black/5 dark:bg-white/10",
        text: "text-gray-600 dark:text-gray-300",
        hover: "group-hover:bg-black/10 dark:group-hover:bg-white/20",
      };
  }
};

export default function QuestionCard({
  question,
  colSpan,
  hasPersistentHover = false,
}: QuestionCardProps) {
  const queryClient = useQueryClient();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't open URL if clicking on the dropdown area
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-container]')) {
      return;
    }

    if (question.url) {
      window.open(question.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ["problem-lists", question.qid],
      queryFn: async () => {
        const response = await axios.get<Record<string, boolean>>(
          `/api/py/problems/${question.qid}/lists`
        );
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const meta = question.is_premium ? `Q${question.qid} • Premium` : `Q${question.qid}`;
  const difficultyColors = getDifficultyColors(question.difficulty);

  return (
    <div
      className={cn(
        "group relative p-3 rounded-xl overflow-x-hidden overflow-y-visible transition-all duration-300 cursor-pointer",
        "border bg-white dark:bg-black",
        "border-gray-200/80 dark:border-white/10",
        "shadow-[0_2px_4px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-none",
        "hover:shadow-[0_6px_16px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
        "hover:-translate-y-0.5 will-change-transform",
        colSpan === 2 ? "md:col-span-2" : "",
        {
          "shadow-[0_6px_16px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)] -translate-y-0.5":
            hasPersistentHover,
          "dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)]":
            hasPersistentHover,
        }
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Dotted pattern background */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          hasPersistentHover
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
      </div>

      {/* Gradient border */}
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-200/40 to-transparent dark:via-white/10 transition-opacity duration-300",
          hasPersistentHover
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        )}
      />

      <div className="relative flex flex-col space-y-1.5">
        {/* Difficulty badge at top left */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
              "transition-colors duration-300",
              difficultyColors.bg,
              difficultyColors.text,
              difficultyColors.hover
            )}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Title and Meta */}
        <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
          {question.title}
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
            {meta}
          </span>
        </h3>

        {/* Tags and Add to List at bottom right */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
            {question.tags?.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-md bg-gray-100/80 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-gray-200/80 dark:hover:bg-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </span>
            ))}
          </div>
          <div
            className="pointer-events-auto relative z-50 overflow-visible"
            data-dropdown-container
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <AddToListDropdown question={question} />
          </div>
        </div>
      </div>
    </div>
  );
}

