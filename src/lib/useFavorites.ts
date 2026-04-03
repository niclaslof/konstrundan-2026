"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "konstrundan-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setFavorites(new Set(ids));
      }
    } catch {
      // Ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    }
  }, [favorites, loaded]);

  const toggleFavorite = useCallback((regionId: string, artistId: number) => {
    const key = `${regionId}-${artistId}`;
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (regionId: string, artistId: number) => {
      return favorites.has(`${regionId}-${artistId}`);
    },
    [favorites]
  );

  return {
    favorites,
    favoriteCount: favorites.size,
    toggleFavorite,
    isFavorite,
    loaded,
  };
}
