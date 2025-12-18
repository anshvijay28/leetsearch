"use client";

type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
};

export default function SearchBar({ query, onQueryChange, onSearch }: SearchBarProps) {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-full bg-black/50 px-4 py-3 mb-8">
      <svg
        className="w-5 h-5 text-zinc-500 shrink-0"
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
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='e.g. "graph problems to practice BFS with medium difficulty"'
        className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-zinc-600"
        autoFocus
      />
      <button
        onClick={onSearch}
        className="shrink-0 rounded-full bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm md:text-base font-semibold px-5 py-2.5 transition-colors"
      >
        Search
      </button>
    </div>
  );
}

