"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SendIcon, Filter, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  error?: string;
  isLoading?: boolean;
  onFilterClick?: () => void;
  filterActiveCount?: number;
  filterButtonRef?: React.RefObject<HTMLButtonElement | null>;
};

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  error,
  isLoading = false,
  onFilterClick,
  filterActiveCount = 0,
  filterButtonRef,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSearch();
    }
  };

  const hasError = !!error;
  const isEmpty = !query.trim();

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "60px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [query]);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <motion.div
          className={cn(
            "group flex-1 relative rounded-2xl border overflow-hidden",
            "bg-white dark:bg-black/90",
            "border-gray-200/60 dark:border-white/10",
            "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-2xl",
            "backdrop-blur-2xl",
            hasError
              ? "border-rose-500/30 bg-rose-50 dark:bg-rose-950/10"
              : "",
            isLoading ? "opacity-50 pointer-events-none" : ""
          )}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => {
                  onQueryChange(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder='e.g. "graph problems to practice BFS with medium difficulty"'
                className={cn(
                  "w-full px-3 py-3 resize-none",
                  "bg-transparent border-none",
                  "text-gray-900 dark:text-white/90 text-sm md:text-base",
                  "focus:outline-none",
                  "placeholder:text-gray-400 dark:placeholder:text-white/20",
                  "min-h-[60px] max-h-[200px]",
                  hasError ? "text-rose-600 dark:text-rose-200 placeholder:text-rose-400 dark:placeholder:text-rose-600/50" : ""
                )}
                rows={1}
                style={{
                  overflow: "hidden",
                  lineHeight: "1.5",
                }}
                autoFocus
              />
              {isFocused && !hasError && (
                <motion.span
                  className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-offset-0 ring-gray-300/40 dark:ring-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </div>
          </div>

          <div className="px-3 py-3 border-t border-gray-200/60 dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onFilterClick && (
                <button
                  ref={filterButtonRef}
                  type="button"
                  onClick={onFilterClick}
                  className={cn(
                    "h-9 w-9 inline-flex items-center justify-center rounded-xl transition-colors relative cursor-pointer",
                    "bg-gray-100/80 dark:bg-white/10",
                    "hover:bg-gray-200/80 dark:hover:bg-white/20",
                    "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  {filterActiveCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-black/70 dark:bg-white/20 text-white text-[10px] font-semibold rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {filterActiveCount}
                    </motion.span>
                  )}
                </button>
              )}
            </div>

            <motion.button
              type="button"
              onClick={onSearch}
              whileTap={{ scale: 0.98 }}
              disabled={isEmpty || isLoading}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                "flex items-center gap-2",
                query.trim() && !isLoading
                  ? "bg-black text-white dark:bg-white dark:text-[#0A0A0B] shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-white/10"
                  : "bg-gray-100/80 dark:bg-white/10 text-gray-500 dark:text-gray-500 cursor-not-allowed hover:bg-gray-200/80 dark:hover:bg-white/20"
              )}
            >
              <SendIcon className="w-4 h-4" />
              <span>Search</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.div
            className="mt-2 ml-4 flex items-center gap-2 text-rose-400 text-sm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

