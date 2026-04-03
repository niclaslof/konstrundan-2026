"use client";

import { useState } from "react";
import { Artist, REGIONS } from "@/lib/types";

interface RoutePlannerProps {
  favorites: Artist[];
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: (artist: Artist) => void;
}

function optimizeRoute(artists: Artist[]): Artist[] {
  // Nearest-neighbor TSP approximation
  if (artists.length <= 2) return artists;

  const remaining = [...artists];
  const route: Artist[] = [remaining.shift()!];

  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((a, i) => {
      const dist = Math.sqrt(
        Math.pow(a.lat - last.lat, 2) + Math.pow(a.lng - last.lng, 2)
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });

    route.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return route;
}

function calcDistance(a: Artist, b: Artist): number {
  // Haversine approximation in km
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function totalDistance(route: Artist[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += calcDistance(route[i], route[i + 1]);
  }
  return total;
}

export default function RoutePlanner({
  favorites,
  isOpen,
  onClose,
  onSelectArtist,
}: RoutePlannerProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<Artist[]>([]);

  const route = optimizedRoute.length > 0 ? optimizedRoute : favorites;
  const distance = route.length > 1 ? totalDistance(route) : 0;
  const driveTime = Math.round((distance / 50) * 60); // ~50 km/h average

  const handleOptimize = () => {
    setOptimizedRoute(optimizeRoute(favorites));
  };

  const handleOpenGoogleMaps = () => {
    if (route.length === 0) return;

    const origin = `${route[0].lat},${route[0].lng}`;
    const destination = `${route[route.length - 1].lat},${route[route.length - 1].lng}`;
    const waypoints = route
      .slice(1, -1)
      .map((a) => `${a.lat},${a.lng}`)
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    url += `&travelmode=driving`;

    window.open(url, "_blank");
  };

  if (!isOpen || favorites.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[92vw] max-h-[80vh] bg-panel rounded-2xl shadow-2xl z-[61] overflow-hidden">
        {/* Header */}
        <div className="bg-ink text-paper px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold">
              Planera din runda
            </h2>
            <p className="text-xs text-warm mt-0.5">
              {favorites.length} konstnärer valda
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-warm hover:text-paper text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        {route.length > 1 && (
          <div className="flex gap-4 px-5 py-3 bg-tag-bg border-b border-stone-200">
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{distance.toFixed(0)} km</div>
              <div className="text-[0.6rem] text-warm uppercase">Total sträcka</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">~{driveTime} min</div>
              <div className="text-[0.6rem] text-warm uppercase">Körtid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{route.length}</div>
              <div className="text-[0.6rem] text-warm uppercase">Stopp</div>
            </div>
          </div>
        )}

        {/* Route list */}
        <div className="overflow-y-auto max-h-[40vh] px-2 py-2">
          {route.map((artist, i) => (
            <div
              key={`${artist.regionId}-${artist.id}`}
              onClick={() => onSelectArtist(artist)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-tag-bg transition-colors"
            >
              <div className="flex flex-col items-center shrink-0">
                <span
                  className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: REGIONS[artist.regionId].color }}
                >
                  {i + 1}
                </span>
                {i < route.length - 1 && (
                  <div className="w-0.5 h-4 bg-stone-300 mt-1" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{artist.name}</div>
                <div className="text-xs text-warm truncate">{artist.location}</div>
              </div>
              {i > 0 && (
                <div className="ml-auto text-xs text-warm shrink-0">
                  {calcDistance(route[i - 1], artist).toFixed(1)} km
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-stone-200 flex flex-col gap-2">
          <button
            onClick={handleOptimize}
            className="w-full py-2.5 rounded-lg bg-stone-100 text-ink text-sm font-semibold hover:bg-stone-200 transition-colors cursor-pointer"
          >
            🔄 Optimera rutt (kortaste vägen)
          </button>
          <button
            onClick={handleOpenGoogleMaps}
            className="w-full py-2.5 rounded-lg bg-ink text-paper text-sm font-semibold hover:bg-accent transition-colors cursor-pointer"
          >
            🧭 Öppna i Google Maps
          </button>
        </div>
      </div>
    </>
  );
}
