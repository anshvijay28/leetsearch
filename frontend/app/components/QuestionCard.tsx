"use client";

import { Question } from "../types";

type QuestionCardProps = {
  question: Question;
};

export default function QuestionCard({
  question,
}: QuestionCardProps) {
  return (
    <div className="relative flex justify-center">
      <div
        className="w-full max-w-2xl text-left bg-gradient-to-r from-[#0a1628] via-[#0f1b2e] to-[#0a1628] border border-[#06b6d4]/20 hover:border-[#06b6d4]/40 hover:bg-gradient-to-r hover:from-[#0f1f35] hover:via-[#15243a] hover:to-[#0f1f35] transition-all px-5 py-5 flex flex-col gap-3 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] rounded-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm md:text-base font-semibold text-white">
            <span className="text-cyan-400 mr-2">Q{question.qid}:</span>
            {question.title}
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide ${
              question.difficulty === "Easy"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : question.difficulty === "Medium"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
          >
            {question.difficulty}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2.5 py-1 rounded-full bg-[#06b6d4]/10 text-cyan-300 border border-[#06b6d4]/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

