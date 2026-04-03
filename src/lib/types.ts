export interface Artist {
  id: number;
  name: string;
  technique: string;
  address: string;
  location: string; // Ort/stad
  phone: string;
  email?: string;
  website?: string;
  instagram?: string;
  lat: number;
  lng: number;
  isNew?: boolean; // Ny medlem 2026
  isHall?: boolean; // Konsthall (Tjörnedala)
  imageUrl?: string;
  description?: string; // Extra info (t.ex. "avvikande öppettider")
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
