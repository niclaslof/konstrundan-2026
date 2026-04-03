"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import MapComponent from "@/components/Map";
import ArtistPanel from "@/components/ArtistPanel";
import ArtistList from "@/components/ArtistList";
import { artists } from "@/data/artists";
import { Artist, TechniqueFilter } from "@/lib/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TechniqueFilter>("all");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return artists.filter((a) => {
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.technique.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q);

      const matchesFilter =
        activeFilter === "all" ||
        a.technique.toLowerCase().includes(activeFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [query, activeFilter]);

  return (
    <>
      <Header artistCount={filtered.length} />
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <MapComponent
        artists={filtered}
        selectedArtist={selectedArtist}
        onSelectArtist={setSelectedArtist}
      />

      <ArtistPanel
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />

      <ArtistList
        artists={filtered}
        isOpen={listOpen}
        onClose={() => setListOpen(false)}
        onSelect={setSelectedArtist}
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
