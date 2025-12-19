"use client";

type LandingPageProps = {
  onBeginSearch: () => void;
};

export default function LandingPage({ onBeginSearch }: LandingPageProps) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#164e63] bg-[#0a1a1f]/70 px-3 py-1 mb-8 w-max mx-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">
            RAG-powered LeetCode discovery
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-tight">
          Describe{" "}
          <span className="text-[#06b6d4]">
            how
          </span>{" "}
          you want to practice,
          <br />
          we&apos;ll find{" "}
          <span className="underline decoration-[#06b6d4]/80 decoration-2 underline-offset-[6px]">
            what
          </span>{" "}
          to solve.
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
          Type in natural language — &quot;medium DP with states&quot;, &quot;intro BFS
          on grids&quot;, or &quot;systems questions with tricky edge cases&quot; — and
          compare three semantic paths of LeetCode problems at once.
        </p>
        <button
          onClick={onBeginSearch}
          className="rounded-full bg-[#06b6d4] hover:bg-[#0891b2] text-white text-base font-semibold px-8 py-4 transition-all shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:scale-105"
        >
          Begin Searching
        </button>
      </div>
    </main>
  );
}

