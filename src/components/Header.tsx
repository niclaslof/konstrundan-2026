"use client";

import { RegionId, REGIONS } from "@/lib/types";

interface HeaderProps {
  artistCount: number;
  activeRegions: RegionId[];
  favoriteCount: number;
}

export default function Header({
  artistCount,
  activeRegions,
  favoriteCount,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ink text-paper">
      <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2.5">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-lg md:text-xl font-bold tracking-tight leading-tight">
              Konstrundan{" "}
              <span className="text-accent">&rsquo;26</span>
            </h1>
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-stone-500">
              Hela Skåne &middot; 3–12 april
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Region dots */}
          <div className="hidden md:flex items-center gap-1">
            {activeRegions.map((rid) => (
              <div
                key={rid}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: REGIONS[rid].color }}
                title={REGIONS[rid].name}
              />
            ))}
          </div>
          {/* Favorite count */}
          {favoriteCount > 0 && (
            <span className="text-[0.7rem] text-amber-400 font-medium">
              ♥ {favoriteCount}
            </span>
          )}
          {/* Artist count */}
          <div className="text-right">
            <span className="text-accent text-base md:text-lg font-bold">{artistCount}</span>
            <span className="text-stone-500 text-[0.65rem] ml-1 hidden sm:inline">konstnärer</span>
          </div>
        </div>
      </div>
    </header>
  );
}
