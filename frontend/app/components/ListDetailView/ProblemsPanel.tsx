"use client";

import { ListProblem } from "./types";
import ProblemPill from "./ProblemPill";

type ProblemsPanelProps = {
  problems: ListProblem[];
  isLoading: boolean;
  onRemove: (qid: number) => void;
  onFindSimilar: (qid: number, title: string) => void;
};

export default function ProblemsPanel({
  problems,
  isLoading,
  onRemove,
  onFindSimilar,
}: ProblemsPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-800 pr-4">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-zinc-300">Problems</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && problems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#06b6d4]">Loading problems...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">
              No problems in this list yet. Search and add problems from the
              right panel!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {problems.map((problem) => (
              <ProblemPill
                key={problem.id}
                qid={problem.problem_qid}
                title={problem.title}
                difficulty={problem.difficulty}
                isPremium={problem.is_premium}
                onRemove={() => onRemove(problem.problem_qid)}
                onFindSimilar={() => onFindSimilar(problem.problem_qid, problem.title)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

