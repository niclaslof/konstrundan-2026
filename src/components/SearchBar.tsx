"use client";

import { techniques } from "@/data/artists";
import { TechniqueFilter } from "@/lib/types";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  activeFilter: TechniqueFilter;
  onFilterChange: (f: TechniqueFilter) => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  activeFilter,
  onFilterChange,
}: SearchBarProps) {
  return (
    <div className="fixed top-[52px] left-0 right-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-stone-200 px-3 py-2 md:px-6">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Sök konstnär, ort, teknik..."
          className="px-3 py-2 rounded-lg border border-stone-300 text-sm w-44 md:w-56 bg-white outline-none focus:border-accent transition-colors"
        />

        <button
          onClick={() => onFilterChange("all")}
          className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === "all"
              ? "bg-accent text-white border-accent"
              : "bg-white border-stone-300 hover:border-accent hover:text-accent"
          }`}
        >
          Alla
        </button>

        {techniques.map((t) => (
          <button
            key={t}
            onClick={() => onFilterChange(t as TechniqueFilter)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === t
                ? "bg-accent text-white border-accent"
                : "bg-white border-stone-300 hover:border-accent hover:text-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
