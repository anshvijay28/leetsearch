"use client";

import { Question } from "../types";

type QuestionCardProps = {
  question: Question;
};

export default function QuestionCard({
  question,
}: QuestionCardProps) {
  const handleClick = () => {
    if (question.url) {
      window.open(question.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative flex justify-center">
      <div
        onClick={handleClick}
        className="w-full max-w-2xl text-left bg-gradient-to-r from-[#0a1628] via-[#0f1b2e] to-[#0a1628] border border-[#06b6d4]/20 hover:border-[#06b6d4]/40 hover:bg-gradient-to-r hover:from-[#0f1f35] hover:via-[#15243a] hover:to-[#0f1f35] transition-all px-5 py-5 flex flex-col gap-3 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] rounded-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="text-sm md:text-base font-semibold text-white flex items-center gap-2 min-w-0">
              <span className="text-cyan-400 mr-2 shrink-0">Q{question.qid}:</span>
              <span className="truncate">{question.title}</span>
            </div>
            {question.is_premium && (
              <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                <svg
                  className="w-3 h-3 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] font-semibold text-yellow-400">Premium</span>
              </div>
            )}
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide shrink-0 ${
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

