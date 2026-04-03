"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Artist, REGIONS } from "@/lib/types";

interface ArtistPanelProps {
  artist: Artist | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ArtistPanel({
  artist,
  onClose,
  isFavorite,
  onToggleFavorite,
}: ArtistPanelProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});

  // Lazy-load descriptions on first open
  useEffect(() => {
    if (artist && Object.keys(descriptions).length === 0) {
      import("@/data/descriptions.json").then((mod) => {
        setDescriptions(mod.default as Record<string, string>);
      });
    }
  }, [artist]);

  if (!artist) return null;

  const techniqueTags = artist.technique.split(",").map((t) => t.trim());
  const region = REGIONS[artist.regionId];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          artist ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed right-0 top-0 bottom-0 w-[420px] max-w-[95vw] bg-panel z-[61] transition-transform duration-350 ease-out shadow-[-4px_0_24px_rgba(0,0,0,0.2)] overflow-y-auto ${
          artist ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with artist image */}
        <div className="relative h-56 bg-gradient-to-br from-tag-bg via-amber-200 to-accent-light flex items-center justify-center overflow-hidden">
          <Image
            src={`/images/artists/${artist.id}.jpg`}
            alt={artist.name}
            width={420}
            height={224}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.classList.add("fallback-active");
            }}
          />
          <span className="absolute text-6xl font-bold text-white/50 font-[family-name:var(--font-playfair)] pointer-events-none hidden [.fallback-active>&]:block">
            #{artist.id}
          </span>

          {/* Favorite button */}
          <button
            onClick={onToggleFavorite}
            className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer text-lg ${
              isFavorite
                ? "bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                : "bg-black/40 hover:bg-amber-500/80 text-white/80 hover:text-white"
            }`}
          >
            {isFavorite ? "♥" : "♡"}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 pb-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span
              className="text-[0.6rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: region.color }}
            >
              {region.shortName}
            </span>
            {artist.isNew && (
              <span className="text-[0.6rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-new-bg text-new-text">
                Ny 2026
              </span>
            )}
            {artist.isHall && (
              <span className="text-[0.6rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                Konsthall
              </span>
            )}
            {techniqueTags.map((tag) => (
              <span
                key={tag}
                className="text-[0.6rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-tag-bg text-tag-text"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Name & technique */}
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold leading-tight mb-1">
            {artist.name}
          </h2>
          <p className="text-sm text-accent font-medium mb-3">
            {artist.technique}
          </p>

          {/* AI Description or fallback */}
          <p className="text-sm text-warm leading-relaxed mb-4">
            {descriptions[`${artist.regionId}-${artist.id}`] ||
              (artist.isHall
                ? `Samlingsutställning med alla deltagande konstnärer i Konstrundan 2026. Öppet lör–sön och helgdagar 10–18, vardagar 13–17. Entré: 100 kr, fri entré under 18 år.`
                : `${artist.name} arbetar med ${artist.technique.toLowerCase()} och ställer ut i sin ateljé i ${artist.location} under Konstrundan 3–12 april 2026.${artist.isNew ? " Ny medlem i ÖSKГ i år!" : ""}`)}
          </p>

          {/* Divider */}
          <div className="w-9 h-[3px] bg-accent rounded-full mb-4" />

          {/* Contact info */}
          <div className="flex flex-col gap-3 mb-5">
            <InfoRow icon="📍" label="Adress" value={`${artist.address}, ${artist.location}`} />
            <InfoRow
              icon="📞"
              label="Telefon"
              value={artist.phone}
              href={`tel:${artist.phone}`}
            />
            {artist.email && (
              <InfoRow
                icon="✉️"
                label="E-post"
                value={artist.email}
                href={`mailto:${artist.email}`}
              />
            )}
            {artist.website && (
              <InfoRow
                icon="🌐"
                label="Webb"
                value={artist.website}
                href={`https://${artist.website}`}
                external
              />
            )}
            {artist.instagram && (
              <InfoRow
                icon="📸"
                label="Instagram"
                value={`@${artist.instagram}`}
                href={`https://instagram.com/${artist.instagram}`}
                external
              />
            )}
            {artist.description && (
              <InfoRow icon="ℹ️" label="Info" value={artist.description} />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(artist.address + ", " + artist.location + ", Sverige")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-paper text-sm font-semibold hover:bg-accent transition-colors"
            >
              🧭 Vägbeskrivning
            </a>
            {artist.website && (
              <a
                href={`https://${artist.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100 text-ink text-sm font-semibold border border-stone-200 hover:border-accent hover:text-accent transition-colors"
              >
                🌐 Hemsida
              </a>
            )}
            <a
              href={`/artist/${artist.regionId}/${artist.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100 text-ink text-sm font-semibold border border-stone-200 hover:border-accent hover:text-accent transition-colors"
            >
              🔗 Dela profil
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex gap-2 text-sm items-start">
      <span className="w-5 text-center shrink-0">{icon}</span>
      <span className="text-warm font-semibold min-w-[52px]">{label}</span>
      {href ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-accent hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-ink break-words">{value}</span>
      )}
    </div>
  );
}
