"use client";

import { useEffect, useCallback, useRef } from "react";
import { APIProvider, Map as GoogleMap, useMap } from "@vis.gl/react-google-maps";
import { Artist } from "@/lib/types";

interface MapProps {
  artists: Artist[];
  selectedArtist: Artist | null;
  onSelectArtist: (artist: Artist) => void;
}

function MarkerLayer({ artists, selectedArtist, onSelectArtist }: MapProps) {
  const map = useMap();
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Pan to selected artist
  useEffect(() => {
    if (map && selectedArtist) {
      map.panTo({ lat: selectedArtist.lat, lng: selectedArtist.lng });
      map.setZoom(14);
    }
  }, [map, selectedArtist]);

  // Create markers
  useEffect(() => {
    if (!map) return;

    // Clear old
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    artists.forEach((artist) => {
      const isHall = artist.isHall;
      const marker = new google.maps.Marker({
        position: { lat: artist.lat, lng: artist.lng },
        map,
        title: artist.name,
        label: {
          text: String(artist.id),
          color: "#fff",
          fontWeight: "700",
          fontSize: "10px",
        },
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
          fillColor: isHall ? "#991b1b" : "#b45309",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22),
          labelOrigin: new google.maps.Point(12, 9),
        },
      });

      marker.addListener("click", () => onSelectArtist(artist));
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [map, artists, onSelectArtist]);

  // Highlight selected marker
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const isSelected = marker.getTitle() === selectedArtist?.name;
      const icon = marker.getIcon() as google.maps.Symbol;
      if (icon) {
        marker.setIcon({
          ...icon,
          fillColor: isSelected ? "#d97706" : marker.getTitle() === "Tjörnedala konsthall" ? "#991b1b" : "#b45309",
          scale: isSelected ? 2 : 1.5,
        });
      }
    });
  }, [selectedArtist]);

  return null;
}

export default function MapComponent({ artists, selectedArtist, onSelectArtist }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="fixed top-[96px] left-0 right-0 bottom-0 flex items-center justify-center bg-stone-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <p className="text-lg font-semibold mb-2">Google Maps API-nyckel saknas</p>
          <p className="text-sm text-warm">
            Lägg till <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> i{" "}
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-[96px] left-0 right-0 bottom-0 z-0">
      <APIProvider apiKey={apiKey}>
        <GoogleMap
          defaultCenter={{ lat: 55.58, lng: 14.12 }}
          defaultZoom={10}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          styles={[
            { elementType: "geometry", stylers: [{ color: "#f5f0eb" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#f5f0eb" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#78716c" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#e7e5e4" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d6d3d1" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#c4d5e3" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dde8d0" }] },
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          ]}
        >
          <MarkerLayer
            artists={artists}
            selectedArtist={selectedArtist}
            onSelectArtist={onSelectArtist}
          />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
