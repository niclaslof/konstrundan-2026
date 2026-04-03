"use client";

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
  const btnBase =
    "px-2.5 py-1 rounded-full text-[0.65rem] font-semibold transition-all cursor-pointer whitespace-nowrap border";
  const btnActive = "text-white";
  const btnInactive = "bg-white hover:opacity-80";

  return (
    <div className="fixed top-[44px] md:top-[48px] left-0 right-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-stone-200">
      <div className="flex items-center gap-1.5 px-2 py-1.5 md:px-5 md:py-2 overflow-x-auto scrollbar-none">
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Sök..."
          className="px-2.5 py-1 md:py-1.5 rounded-full border border-stone-300 text-[0.7rem] md:text-xs w-24 md:w-48 bg-white outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all shrink-0"
        />

        {/* Favorites */}
        {favoriteCount > 0 && (
          <button
            onClick={onToggleFavorites}
            className={`${btnBase} ${
              showFavoritesOnly
                ? `${btnActive} bg-amber-500 border-amber-500`
                : `${btnInactive} border-amber-300 text-amber-600`
            }`}
          >
            ♥ {favoriteCount}
          </button>
        )}

        {/* Regions */}
        {availableRegions.map((rid) => {
          const region = REGIONS[rid];
          const isActive = activeRegions.includes(rid);
          return (
            <button
              key={rid}
              onClick={() => onRegionToggle(rid)}
              className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
              style={{
                backgroundColor: isActive ? region.color : undefined,
                borderColor: region.color,
                color: isActive ? "#fff" : region.color,
              }}
              title={region.name}
            >
              {region.shortName}
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-4 bg-stone-300 shrink-0 hidden md:block" />

        {/* Techniques */}
        <button
          onClick={onClearFilters}
          className={`${btnBase} ${
            activeFilters.length === 0
              ? `${btnActive} bg-stone-800 border-stone-800`
              : `${btnInactive} border-stone-300 text-stone-600`
          }`}
        >
          Alla
        </button>
        {techniques.map((t) => {
          const isActive = activeFilters.includes(t as TechniqueFilter);
          return (
            <button
              key={t}
              onClick={() => onFilterToggle(t as TechniqueFilter)}
              className={`${btnBase} ${
                isActive
                  ? `${btnActive} bg-stone-800 border-stone-800`
                  : `${btnInactive} border-stone-300 text-stone-600`
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
