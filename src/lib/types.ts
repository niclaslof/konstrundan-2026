export type RegionId = "ostra" | "vastra" | "nordvastra" | "mittskane" | "sydvastra";

export interface Region {
  id: RegionId;
  name: string;
  shortName: string;
  organization: string;
  website: string;
  color: string;        // Primary color hex
  colorLight: string;   // Light variant for tags/backgrounds
  colorDark: string;    // Dark variant for text on light bg
  dates: string;        // e.g. "3–12 april"
  year: number;
}

export interface Artist {
  id: number;
  regionId: RegionId;
  name: string;
  technique: string;
  address: string;
  location: string;
  phone: string;
  email?: string;
  website?: string;
  instagram?: string;
  lat: number;
  lng: number;
  isNew?: boolean;
  isHall?: boolean;
  imageUrl?: string;
  description?: string;
  aiDescription?: string;
  /** @internal Address geocoding confidence – not shown to users */
  addressConfidence?: "verified" | "city" | "approximate" | "unknown";
}

export type TechniqueFilter =
  | "all"
  | "Måleri"
  | "Keramik"
  | "Skulptur"
  | "Grafik"
  | "Textil"
  | "Glas"
  | "Foto";

export const REGIONS: Record<RegionId, Region> = {
  ostra: {
    id: "ostra",
    name: "Östra Skåne",
    shortName: "Östra",
    organization: "ÖSKГ (Östra Skånes Konstnärsgrupp)",
    website: "oskg.se",
    color: "#b45309",      // Amber
    colorLight: "#fef3c7",
    colorDark: "#92400e",
    dates: "3–12 april",
    year: 2026,
  },
  vastra: {
    id: "vastra",
    name: "Västra Skåne",
    shortName: "Västra",
    organization: "VSKG (Västra Skånes Konstnärsgille)",
    website: "vskg.se",
    color: "#1d4ed8",      // Blue
    colorLight: "#dbeafe",
    colorDark: "#1e3a8a",
    dates: "4–12 april",
    year: 2026,
  },
  nordvastra: {
    id: "nordvastra",
    name: "Nordvästra Skåne",
    shortName: "Nordvästra",
    organization: "Konstrundan i Nordvästra Skåne",
    website: "konstrundan.se",
    color: "#15803d",      // Green
    colorLight: "#dcfce7",
    colorDark: "#166534",
    dates: "3–12 april",
    year: 2026,
  },
  mittskane: {
    id: "mittskane",
    name: "Mittskåne",
    shortName: "Mitt",
    organization: "Konstgillet Mittskåne",
    website: "konstrundan.com",
    color: "#7c3aed",      // Purple
    colorLight: "#ede9fe",
    colorDark: "#5b21b6",
    dates: "3–12 april",
    year: 2026,
  },
  sydvastra: {
    id: "sydvastra",
    name: "Sydvästra Skåne",
    shortName: "Sydvästra",
    organization: "KSV (Konstnärsgruppen Sydväst)",
    website: "ksvkonst.se",
    color: "#dc2626",      // Red
    colorLight: "#fee2e2",
    colorDark: "#991b1b",
    dates: "3–12 april",
    year: 2026,
  },
};

export const techniques = [
  "Måleri",
  "Keramik",
  "Skulptur",
  "Grafik",
  "Textil",
  "Glas",
  "Foto",
] as const;
