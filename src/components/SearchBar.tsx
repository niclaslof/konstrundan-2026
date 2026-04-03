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
  return (
    <div className="fixed top-[52px] left-0 right-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-stone-200 px-2 py-1.5 md:px-6 md:py-2">
      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Sök konstnär, ort..."
          className="px-2.5 py-1.5 md:py-2 rounded-lg border border-stone-300 text-sm w-36 md:w-56 bg-white outline-none focus:border-accent transition-colors"
        />

        {/* Favorites filter */}
        {favoriteCount > 0 && (
          <button
            onClick={onToggleFavorites}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full border text-[0.65rem] md:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              showFavoritesOnly
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white border-amber-400 text-amber-600 hover:bg-amber-50"
            }`}
          >
            ♥ {favoriteCount}
          </button>
        )}

        {/* Region filter buttons */}
        {availableRegions.map((rid) => {
          const region = REGIONS[rid];
          const isActive = activeRegions.includes(rid);
          return (
            <button
              key={rid}
              onClick={() => onRegionToggle(rid)}
              className="px-2 py-1 md:px-3 md:py-1.5 rounded-full border text-[0.65rem] md:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: isActive ? region.color : "#fff",
                color: isActive ? "#fff" : region.color,
                borderColor: region.color,
              }}
              title={region.name}
            >
              {region.shortName}
            </button>
          );
        })}

        {/* Separator */}
        <div className="w-px h-5 bg-stone-300 mx-1 hidden md:block" />

        {/* Technique filters – multi-select */}
        <button
          onClick={onClearFilters}
          className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full border text-[0.65rem] md:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilters.length === 0
              ? "bg-ink text-white border-ink"
              : "bg-white border-stone-300 hover:border-ink hover:text-ink"
          }`}
        >
          Alla tekniker
        </button>
        {techniques.map((t) => {
          const isActive = activeFilters.includes(t as TechniqueFilter);
          return (
            <button
              key={t}
              onClick={() => onFilterToggle(t as TechniqueFilter)}
              className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full border text-[0.65rem] md:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-ink text-white border-ink"
                  : "bg-white border-stone-300 hover:border-ink hover:text-ink"
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
