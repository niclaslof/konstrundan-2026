import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { allArtists } from "@/data/artists";
import { REGIONS } from "@/lib/types";
import descriptions from "@/data/descriptions.json";

interface Props {
  params: Promise<{ regionId: string; id: string }>;
}

export function generateStaticParams() {
  return allArtists.map((a) => ({
    regionId: a.regionId,
    id: String(a.id),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { regionId, id } = await params;
  const artist = allArtists.find(
    (a) => a.regionId === regionId && a.id === Number(id)
  );
  if (!artist) return { title: "Konstnär ej hittad" };

  const desc =
    (descriptions as Record<string, string>)[`${regionId}-${id}`] ||
    `${artist.name} – ${artist.technique}`;

  return {
    title: `${artist.name} – Konstrundan 2026`,
    description: desc,
    openGraph: {
      title: `${artist.name} – Konstrundan 2026`,
      description: desc,
    },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { regionId, id } = await params;
  const artist = allArtists.find(
    (a) => a.regionId === regionId && a.id === Number(id)
  );

  if (!artist) notFound();

  const region = REGIONS[artist.regionId];
  const description =
    (descriptions as Record<string, string>)[`${regionId}-${id}`] || "";
  const techniqueTags = artist.technique.split(",").map((t) => t.trim());

  return (
    <div className="min-h-screen bg-paper">
      {/* Back link */}
      <div className="sticky top-0 z-10 bg-ink text-paper px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-warm hover:text-paper transition-colors">
          ← Tillbaka till kartan
        </Link>
        <span className="text-warm">|</span>
        <span className="font-[family-name:var(--font-playfair)] font-bold">
          Konstrundan <span className="text-accent">&rsquo;26</span>
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Image */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-tag-bg via-amber-200 to-accent-light mb-6">
          <Image
            src={`/images/artists/${artist.id}.jpg`}
            alt={artist.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span
            className="text-[0.65rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: region.color }}
          >
            {region.name}
          </span>
          {artist.isNew && (
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-new-bg text-new-text">
              Ny 2026
            </span>
          )}
          {techniqueTags.map((tag) => (
            <span
              key={tag}
              className="text-[0.65rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-tag-bg text-tag-text"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Name */}
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-2">
          {artist.name}
        </h1>
        <p className="text-accent font-medium mb-4">{artist.technique}</p>

        {/* Description */}
        {description && (
          <p className="text-warm leading-relaxed mb-6 text-lg">{description}</p>
        )}

        <div className="w-12 h-[3px] bg-accent rounded-full mb-6" />

        {/* Contact info */}
        <div className="grid gap-3 mb-8">
          <ContactRow icon="📍" label="Adress" value={`${artist.address}, ${artist.location}`} />
          <ContactRow icon="📞" label="Telefon" value={artist.phone} href={`tel:${artist.phone}`} />
          {artist.email && (
            <ContactRow icon="✉️" label="E-post" value={artist.email} href={`mailto:${artist.email}`} />
          )}
          {artist.website && (
            <ContactRow icon="🌐" label="Webb" value={artist.website} href={`https://${artist.website}`} external />
          )}
          {artist.instagram && (
            <ContactRow icon="📸" label="Instagram" value={`@${artist.instagram}`} href={`https://instagram.com/${artist.instagram}`} external />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(artist.address + ", " + artist.location + ", Sverige")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-ink text-paper font-semibold hover:bg-accent transition-colors"
          >
            🧭 Vägbeskrivning
          </a>
          {artist.website && (
            <a
              href={`https://${artist.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 text-ink font-semibold border border-stone-200 hover:border-accent hover:text-accent transition-colors"
            >
              🌐 Hemsida
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactRow({
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
    <div className="flex gap-3 items-start">
      <span className="w-5 text-center shrink-0">{icon}</span>
      <span className="text-warm font-semibold min-w-[56px]">{label}</span>
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
        <span className="break-words">{value}</span>
      )}
    </div>
  );
}
