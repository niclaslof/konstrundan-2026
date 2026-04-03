"use client";

import { RegionId, REGIONS } from "@/lib/types";

interface HeaderProps {
  artistCount: number;
  activeRegions: RegionId[];
  favoriteCount: number;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function Header({
  artistCount,
  activeRegions,
  favoriteCount,
  isDark,
  onToggleDark,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1c1917] text-[#faf8f5]">
      <div className="flex items-center justify-between px-3 py-1.5 md:px-5 md:py-2">
        {/* Logo */}
        <h1 className="font-[family-name:var(--font-playfair)] text-base md:text-lg font-bold tracking-tight">
          Konstrundan <span className="text-[#b45309]">&rsquo;26</span>
        </h1>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Region dots */}
          <div className="flex items-center gap-0.5">
            {activeRegions.map((rid) => (
              <div
                key={rid}
                className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                style={{ backgroundColor: REGIONS[rid].color }}
              />
            ))}
          </div>
          {/* Favorites */}
          {favoriteCount > 0 && (
            <span className="text-[0.65rem] text-amber-400">♥{favoriteCount}</span>
          )}
          {/* Count */}
          <span className="text-[#b45309] text-sm md:text-base font-bold">{artistCount}</span>
          {/* Dark toggle */}
          <button
            onClick={onToggleDark}
            className="text-sm cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            title={isDark ? "Ljust läge" : "Mörkt läge"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
