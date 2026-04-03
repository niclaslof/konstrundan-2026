"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import MapComponent from "@/components/Map";
import ArtistPanel from "@/components/ArtistPanel";
import ArtistList from "@/components/ArtistList";
import { allArtists } from "@/data/artists";
import { Artist, RegionId, TechniqueFilter } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";

const availableRegions = [
  ...new Set(allArtists.map((a) => a.regionId)),
] as RegionId[];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TechniqueFilter>("all");
  const [activeRegions, setActiveRegions] =
    useState<RegionId[]>(availableRegions);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { favorites, favoriteCount, toggleFavorite, isFavorite } =
    useFavorites();

  const handleRegionToggle = (regionId: RegionId) => {
    setActiveRegions((prev) => {
      if (prev.includes(regionId)) {
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== regionId);
      }
      return [...prev, regionId];
    });
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allArtists.filter((a) => {
      if (showFavoritesOnly && !isFavorite(a.regionId, a.id)) return false;

      const matchesRegion = activeRegions.includes(a.regionId);
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.technique.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);
      const matchesFilter =
        activeFilter === "all" ||
        a.technique.toLowerCase().includes(activeFilter.toLowerCase());

      return matchesRegion && matchesSearch && matchesFilter;
    });
  }, [query, activeFilter, activeRegions, showFavoritesOnly, isFavorite]);

  return (
    <>
      <Header
        artistCount={filtered.length}
        activeRegions={activeRegions}
        favoriteCount={favoriteCount}
      />
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeRegions={activeRegions}
        onRegionToggle={handleRegionToggle}
        availableRegions={availableRegions}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        favoriteCount={favoriteCount}
      />

      <MapComponent
        artists={filtered}
        selectedArtist={selectedArtist}
        onSelectArtist={setSelectedArtist}
        isFavorite={isFavorite}
      />

      <ArtistPanel
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
        isFavorite={
          selectedArtist
            ? isFavorite(selectedArtist.regionId, selectedArtist.id)
            : false
        }
        onToggleFavorite={() => {
          if (selectedArtist)
            toggleFavorite(selectedArtist.regionId, selectedArtist.id);
        }}
      />

      <ArtistList
        artists={filtered}
        isOpen={listOpen}
        onClose={() => setListOpen(false)}
        onSelect={setSelectedArtist}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />

      {/* Bottom bar */}
      <div className="fixed bottom-4 left-3 z-50 flex gap-2">
        <button
          onClick={() => setListOpen(!listOpen)}
          className="px-4 py-2.5 rounded-xl bg-ink text-paper text-sm font-semibold shadow-[0_3px_12px_rgba(0,0,0,0.25)] hover:bg-accent transition-colors cursor-pointer flex items-center gap-2"
        >
          📋 Lista
        </button>
      </div>
    </>
  );
}
