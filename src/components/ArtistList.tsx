"use client";

import { Artist, REGIONS } from "@/lib/types";

interface ArtistListProps {
  artists: Artist[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (artist: Artist) => void;
  isFavorite: (regionId: string, artistId: number) => boolean;
  onToggleFavorite: (regionId: string, artistId: number) => void;
}

export default function ArtistList({
  artists,
  isOpen,
  onClose,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: ArtistListProps) {
  return (
    <>
      {/* Side panel */}
      <div
        className={`fixed left-0 top-[68px] md:top-[72px] bottom-0 w-72 md:w-80 bg-panel z-[55] overflow-y-auto transition-transform duration-300 border-r border-stone-200 shadow-[4px_0_16px_rgba(0,0,0,0.1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-ink text-paper px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            Alla konstnärer ({artists.length})
          </h3>
          <button
            onClick={onClose}
            className="text-warm hover:text-paper text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div>
          {artists
            .sort((a, b) => a.id - b.id)
            .map((artist) => {
              const fav = isFavorite(artist.regionId, artist.id);
              return (
              <div
                key={`${artist.regionId}-${artist.id}`}
                onClick={() => {
                  onSelect(artist);
                  onClose();
                }}
                className={`flex items-center gap-3 px-4 py-2.5 border-b border-stone-100 cursor-pointer hover:bg-tag-bg transition-colors ${fav ? "bg-amber-50" : ""}`}
              >
                <span
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[0.6rem] font-bold shrink-0 ${fav ? "ring-2 ring-amber-400" : ""}`}
                  style={{ backgroundColor: REGIONS[artist.regionId].color }}
                >
                  {artist.id}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-ink truncate">
                    {artist.name}
                    {artist.isNew && (
                      <span className="ml-1.5 text-new-text">★</span>
                    )}
                  </div>
                  <div className="text-[0.65rem] text-warm truncate">
                    {artist.technique}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(artist.regionId, artist.id);
                  }}
                  className={`shrink-0 w-6 h-6 flex items-center justify-center text-sm cursor-pointer transition-colors ${
                    fav ? "text-amber-500" : "text-stone-300 hover:text-amber-400"
                  }`}
                >
                  {fav ? "♥" : "♡"}
                </button>
              </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
