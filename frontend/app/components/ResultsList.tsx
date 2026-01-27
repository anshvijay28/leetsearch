"use client";

import { motion } from "framer-motion";
import { Question } from "../types";
import QuestionCard from "./QuestionCard";

type ResultsListProps = {
  results: Question[];
  isLoading?: boolean;
};

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-gray-600 dark:bg-gray-400 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 4px rgba(0, 0, 0, 0.2)"
          }}
        />
      ))}
    </div>
  );
}

export default function ResultsList({
  results,
  isLoading = false,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="rounded-full px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200/60 dark:border-white/10 bg-white dark:bg-black">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Searching</span>
            <TypingDots />
          </div>
        </div>
      </motion.div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen min-h-0">
      <motion.div
        className="flex items-center justify-between mb-6 flex-shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-[11px] uppercase tracking-[0.18em] text-gray-600 dark:text-gray-400">
          Results
        </div>
        <div className="text-[11px] text-gray-600 dark:text-gray-400">
          {results.length}{" "}
          {results.length === 1 ? "match" : "matches"}
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="grid grid-cols-1 gap-3 pb-24">
          {results.map((q, index) => {
            const hasPersistentHover = false;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.05,
                  mass: 0.8,
                }}
              >
                <QuestionCard
                  question={q}
                  hasPersistentHover={hasPersistentHover}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

