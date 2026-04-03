"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import MapComponent from "@/components/Map";
import ArtistPanel from "@/components/ArtistPanel";
import ArtistList from "@/components/ArtistList";
import RoutePlanner from "@/components/RoutePlanner";
import { allArtists } from "@/data/artists";
import { Artist, RegionId, TechniqueFilter, techniques } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";
import { useDarkMode } from "@/lib/useDarkMode";

const availableRegions = [
  ...new Set(allArtists.map((a) => a.regionId)),
] as RegionId[];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<TechniqueFilter[]>([]);
  const [activeRegions, setActiveRegions] =
    useState<RegionId[]>(availableRegions);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);

  const { favorites, favoriteCount, toggleFavorite, isFavorite } =
    useFavorites();
  const { isDark, toggle: toggleDark } = useDarkMode();

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
    let result = allArtists.filter((a) => {
      if (showFavoritesOnly && !isFavorite(a.regionId, a.id)) return false;

      const matchesRegion = activeRegions.includes(a.regionId);
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.technique.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);
      const matchesFilter =
        activeFilters.length === 0 ||
        activeFilters.some((f) =>
          a.technique.toLowerCase().includes(f.toLowerCase())
        );

      return matchesRegion && matchesSearch && matchesFilter;
    });

    return result;
  }, [query, activeFilters, activeRegions, showFavoritesOnly, isFavorite]);

  const favoriteArtists = allArtists.filter((a) =>
    isFavorite(a.regionId, a.id)
  );

  return (
    <>
      <Header
        artistCount={filtered.length}
        activeRegions={activeRegions}
        favoriteCount={favoriteCount}
        isDark={isDark}
        onToggleDark={toggleDark}
      />
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        activeFilters={activeFilters}
        onFilterToggle={(f: TechniqueFilter) => {
          setActiveFilters((prev) =>
            prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
          );
        }}
        onClearFilters={() => setActiveFilters([])}
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

      <RoutePlanner
        favorites={favoriteArtists}
        isOpen={routeOpen}
        onClose={() => setRouteOpen(false)}
        onSelectArtist={(a) => {
          setRouteOpen(false);
          setSelectedArtist(a);
        }}
      />

      {/* Bottom bar – clean, minimal */}
      <div className="fixed bottom-4 left-3 right-3 z-50 flex gap-2 justify-center pointer-events-none">
        <button
          onClick={() => setListOpen(!listOpen)}
          className="pointer-events-auto px-4 py-2 rounded-full bg-ink/90 backdrop-blur-sm text-paper text-xs font-medium shadow-lg hover:bg-ink transition-colors cursor-pointer"
        >
          Lista ({filtered.length})
        </button>
        {favoriteCount > 0 && (
          <button
            onClick={() => setRouteOpen(true)}
            className="pointer-events-auto px-4 py-2 rounded-full bg-accent/90 backdrop-blur-sm text-paper text-xs font-medium shadow-lg hover:bg-accent transition-colors cursor-pointer"
          >
            Planera rutt ♥ {favoriteCount}
          </button>
        )}
      </div>
    </>
  );
}
