"use client";

import { RegionId, REGIONS, TechniqueFilter, techniques } from "@/lib/types";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  activeFilter: TechniqueFilter;
  onFilterChange: (f: TechniqueFilter) => void;
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
  activeFilter,
  onFilterChange,
  activeRegions,
  onRegionToggle,
  availableRegions,
  showFavoritesOnly,
  onToggleFavorites,
  favoriteCount,
}: SearchBarProps) {
  return (
    <div className="fixed top-[52px] left-0 right-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-stone-200 px-3 py-2 md:px-6">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Sök konstnär, ort, teknik..."
          className="px-3 py-2 rounded-lg border border-stone-300 text-sm w-44 md:w-56 bg-white outline-none focus:border-accent transition-colors"
        />

        {/* Favorites filter */}
        {favoriteCount > 0 && (
          <button
            onClick={onToggleFavorites}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
              className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
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

        {/* Technique filter */}
        <button
          onClick={() => onFilterChange("all")}
          className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === "all"
              ? "bg-ink text-white border-ink"
              : "bg-white border-stone-300 hover:border-ink hover:text-ink"
          }`}
        >
          Alla tekniker
        </button>
        {techniques.map((t) => (
          <button
            key={t}
            onClick={() => onFilterChange(t as TechniqueFilter)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === t
                ? "bg-ink text-white border-ink"
                : "bg-white border-stone-300 hover:border-ink hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
