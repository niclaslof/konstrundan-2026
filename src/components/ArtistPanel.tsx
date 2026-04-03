"use client";

import { Artist } from "@/lib/types";

interface ArtistPanelProps {
  artist: Artist | null;
  onClose: () => void;
}

export default function ArtistPanel({ artist, onClose }: ArtistPanelProps) {
  if (!artist) return null;

  const techniqueTags = artist.technique.split(",").map((t) => t.trim());

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
        className={`fixed right-0 top-0 bottom-0 w-[420px] max-w-[95vw] bg-panel z-[61] transition-transform duration-350 ease-out shadow-[-4px_0_24px_rgba(0,0,0,0.2)] overflow-y-auto ${
          artist ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header gradient */}
        <div className="relative h-48 bg-gradient-to-br from-tag-bg via-amber-200 to-accent-light flex items-center justify-center overflow-hidden">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl font-bold text-white/50 font-[family-name:var(--font-playfair)]">
              #{artist.id}
            </span>
          )}

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
          <p className="text-sm text-accent font-medium mb-4">
            {artist.technique}
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
              href={`https://www.google.com/maps/directions/?api=1&destination=${artist.lat},${artist.lng}`}
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
