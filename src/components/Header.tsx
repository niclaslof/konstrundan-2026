"use client";

import { RegionId, REGIONS } from "@/lib/types";

interface HeaderProps {
  artistCount: number;
  activeRegions: RegionId[];
}

export default function Header({ artistCount, activeRegions }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ink text-paper border-b-[3px] border-accent">
      <div className="flex items-center justify-between px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight">
              Konstrundan{" "}
              <span className="text-accent">&rsquo;26</span>
            </h1>
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-warm">
              Hela Skåne &middot; Påsk 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Region color dots */}
          <div className="hidden md:flex items-center gap-1.5">
            {activeRegions.map((rid) => (
              <div
                key={rid}
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: REGIONS[rid].color }}
                title={REGIONS[rid].name}
              />
            ))}
          </div>
          <div className="text-right text-xs text-warm">
            <span className="text-accent text-lg font-bold">{artistCount}</span>{" "}
            konstnärer
          </div>
        </div>
      </div>
    </header>
  );
}
