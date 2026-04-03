"use client";

import { useState, useEffect } from "react";
import { Artist, REGIONS } from "@/lib/types";

interface RoutePlannerProps {
  favorites: Artist[];
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: (artist: Artist) => void;
}

function optimizeRoute(artists: Artist[], startLat?: number, startLng?: number): Artist[] {
  if (artists.length <= 1) return artists;

  const remaining = [...artists];
  const route: Artist[] = [];

  // If we have a start position, find nearest to that first
  if (startLat !== undefined && startLng !== undefined) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((a, i) => {
      const dist = Math.sqrt(Math.pow(a.lat - startLat, 2) + Math.pow(a.lng - startLng, 2));
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });
    route.push(remaining.splice(nearestIdx, 1)[0]);
  } else {
    route.push(remaining.shift()!);
  }

  // Nearest-neighbor for rest
  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((a, i) => {
      const dist = Math.sqrt(Math.pow(a.lat - last.lat, 2) + Math.pow(a.lng - last.lng, 2));
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });
    route.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return route;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalRouteDistance(route: Artist[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += calcDistance(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
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
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingPos, setGettingPos] = useState(false);

  // Reset when favorites change
  useEffect(() => {
    setOptimizedRoute([]);
  }, [favorites.length]);

  const route = optimizedRoute.length > 0 ? optimizedRoute : favorites;
  const distance = route.length > 1 ? totalRouteDistance(route) : 0;
  const driveTime = Math.round((distance / 50) * 60);

  const handleGetPosition = () => {
    setGettingPos(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingPos(false);
      },
      () => setGettingPos(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOptimize = () => {
    setOptimizedRoute(optimizeRoute(favorites, userPos?.lat, userPos?.lng));
  };

  const handleOpenGoogleMaps = () => {
    if (route.length === 0) return;

    // Use coordinates (always reliable) – addresses can be garbage from scraping
    const toPoint = (a: Artist) => `${a.lat},${a.lng}`;

    const origin = userPos ? `${userPos.lat},${userPos.lng}` : toPoint(route[0]);
    const destination = toPoint(route[route.length - 1]);
    const waypointList = userPos ? route.slice(0, -1) : route.slice(1, -1);
    const waypoints = waypointList.map(toPoint).join("|");

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) url += `&waypoints=${waypoints}`;

    window.open(url, "_blank");
  };

  if (!isOpen || favorites.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[95vw] max-h-[85vh] bg-panel rounded-2xl shadow-2xl z-[61] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-ink text-paper px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold">
              Planera din runda
            </h2>
            <p className="text-xs text-warm mt-0.5">
              {favorites.length} konstnärer valda
            </p>
          </div>
          <button onClick={onClose} className="text-warm hover:text-paper text-xl cursor-pointer">
            ✕
          </button>
        </div>

        {/* Start position */}
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 shrink-0">
          <p className="text-xs text-warm font-semibold uppercase mb-2">Startpunkt</p>
          {userPos ? (
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm">📍 Din position hämtad</span>
              <button
                onClick={() => setUserPos(null)}
                className="text-xs text-warm hover:text-ink cursor-pointer"
              >
                ✕ Rensa
              </button>
            </div>
          ) : (
            <button
              onClick={handleGetPosition}
              disabled={gettingPos}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-sm font-medium cursor-pointer hover:border-accent transition-colors disabled:opacity-50"
            >
              {gettingPos ? "⏳ Hämtar position..." : "📍 Använd min position som start"}
            </button>
          )}
        </div>

        {/* Stats */}
        {route.length > 1 && (
          <div className="flex gap-4 px-5 py-3 bg-tag-bg border-b border-stone-200 shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{distance.toFixed(0)} km</div>
              <div className="text-[0.6rem] text-warm uppercase">Sträcka</div>
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
        <div className="overflow-y-auto flex-1 px-2 py-2">
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
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{artist.name}</div>
                <div className="text-xs text-warm truncate">{artist.location} · {artist.technique}</div>
              </div>
              {i > 0 && (
                <div className="ml-auto text-xs text-warm shrink-0">
                  {calcDistance(route[i - 1].lat, route[i - 1].lng, artist.lat, artist.lng).toFixed(1)} km
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-stone-200 flex flex-col gap-2 shrink-0">
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
