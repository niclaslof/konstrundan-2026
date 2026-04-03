"use client";

import { useState } from "react";
import { RegionId, REGIONS, TechniqueFilter, techniques } from "@/lib/types";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  activeFilters: TechniqueFilter[];
  onFilterToggle: (f: TechniqueFilter) => void;
  onClearFilters: () => void;
  activeRegions: RegionId[];
  onRegionToggle: (r: RegionId) => void;
  availableRegions: RegionId[];
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
}

export default function SearchBar({
  query,
  onQueryChange,
  activeFilters,
  onFilterToggle,
  onClearFilters,
  activeRegions,
  onRegionToggle,
  availableRegions,
  showFavoritesOnly,
  onToggleFavorites,
  favoriteCount,
}: SearchBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const pill =
    "px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[0.6rem] md:text-[0.65rem] font-semibold cursor-pointer whitespace-nowrap transition-all border";

  const activeCount = activeFilters.length;

  return (
    <div className="fixed top-[36px] md:top-[40px] left-0 right-0 z-40">
      {/* Main bar */}
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 px-2 py-1 md:px-4 md:py-1.5">
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Sök konstnär..."
            className="px-2 py-1 rounded-full border border-stone-300 dark:border-stone-600 text-[0.65rem] md:text-xs w-28 md:w-44 bg-white dark:bg-stone-800 dark:text-stone-100 outline-none focus:border-[#b45309] transition-colors shrink-0"
          />

          {/* Favorites */}
          {favoriteCount > 0 && (
            <button
              onClick={onToggleFavorites}
              className={`${pill} ${
                showFavoritesOnly
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-white dark:bg-stone-800 border-amber-300 text-amber-600"
              }`}
            >
              ♥{favoriteCount}
            </button>
          )}

          {/* Region pills – always visible */}
          {availableRegions.map((rid) => {
            const r = REGIONS[rid];
            const on = activeRegions.includes(rid);
            return (
              <button
                key={rid}
                onClick={() => onRegionToggle(rid)}
                className={`${pill} ${on ? "text-white" : "text-stone-500 bg-white dark:bg-stone-800"}`}
                style={{
                  backgroundColor: on ? r.color : undefined,
                  borderColor: on ? r.color : "#d6d3d1",
                }}
              >
                {r.shortName}
              </button>
            );
          })}

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`${pill} ml-auto ${
              activeCount > 0
                ? "bg-stone-800 border-stone-800 text-white"
                : "bg-white dark:bg-stone-800 border-stone-300 text-stone-500"
            }`}
          >
            {activeCount > 0 ? `Teknik (${activeCount})` : "Teknik ▾"}
          </button>
        </div>
      </div>

      {/* Expandable technique filter */}
      {filtersOpen && (
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 px-2 py-1.5 md:px-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { onClearFilters(); setFiltersOpen(false); }}
              className={`${pill} ${
                activeCount === 0
                  ? "bg-stone-800 border-stone-800 text-white"
                  : "bg-white dark:bg-stone-800 border-stone-300 text-stone-500"
              }`}
            >
              Alla
            </button>
            {techniques.map((t) => {
              const on = activeFilters.includes(t as TechniqueFilter);
              return (
                <button
                  key={t}
                  onClick={() => onFilterToggle(t as TechniqueFilter)}
                  className={`${pill} ${
                    on
                      ? "bg-stone-800 border-stone-800 text-white"
                      : "bg-white dark:bg-stone-800 border-stone-300 text-stone-500"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
