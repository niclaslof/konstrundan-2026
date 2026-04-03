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
import { useGeolocation, distanceFromUser } from "@/lib/useGeolocation";

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
  const [sortByDistance, setSortByDistance] = useState(false);

  const { favorites, favoriteCount, toggleFavorite, isFavorite } =
    useFavorites();
  const { position, loading: geoLoading, requestPosition } = useGeolocation();

  const handleRegionToggle = (regionId: RegionId) => {
    setActiveRegions((prev) => {
      if (prev.includes(regionId)) {
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== regionId);
      }
      return [...prev, regionId];
    });
  };

  const handleNearMe = () => {
    if (position) {
      setSortByDistance(!sortByDistance);
    } else {
      requestPosition();
      setSortByDistance(true);
    }
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

    // Sort by distance if position available
    if (sortByDistance && position) {
      result = [...result].sort(
        (a, b) =>
          distanceFromUser(position.lat, position.lng, a.lat, a.lng) -
          distanceFromUser(position.lat, position.lng, b.lat, b.lng)
      );
    }

    return result;
  }, [query, activeFilters, activeRegions, showFavoritesOnly, isFavorite, sortByDistance, position]);

  const favoriteArtists = allArtists.filter((a) =>
    isFavorite(a.regionId, a.id)
  );

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

      {/* Bottom bar */}
      <div className="fixed bottom-4 left-3 z-50 flex gap-2">
        <button
          onClick={() => setListOpen(!listOpen)}
          className="px-3 py-2.5 md:px-4 rounded-xl bg-ink text-paper text-xs md:text-sm font-semibold shadow-[0_3px_12px_rgba(0,0,0,0.25)] hover:bg-accent transition-colors cursor-pointer flex items-center gap-1.5"
        >
          📋 Lista
        </button>
        <button
          onClick={handleNearMe}
          className={`px-3 py-2.5 md:px-4 rounded-xl text-xs md:text-sm font-semibold shadow-[0_3px_12px_rgba(0,0,0,0.25)] transition-colors cursor-pointer flex items-center gap-1.5 ${
            sortByDistance
              ? "bg-accent text-paper"
              : "bg-ink text-paper hover:bg-accent"
          }`}
        >
          {geoLoading ? "⏳" : "📍"} Nära mig
        </button>
        {favoriteCount > 0 && (
          <button
            onClick={() => setRouteOpen(true)}
            className="px-3 py-2.5 md:px-4 rounded-xl bg-amber-600 text-paper text-xs md:text-sm font-semibold shadow-[0_3px_12px_rgba(0,0,0,0.25)] hover:bg-amber-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            🧭 Planera rutt ({favoriteCount})
          </button>
        )}
      </div>
    </>
  );
}
