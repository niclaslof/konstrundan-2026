import { Artist } from "@/lib/types";
import { ostraArtists } from "./regions/ostra";

// Import future regions here:
import { vastraArtists } from "./regions/vastra";
import { nordvastraArtists } from "./regions/nordvastra";
import { mittskaneArtists } from "./regions/mittskane";
import { sydvastraArtists } from "./regions/sydvastra";

export const allArtists: Artist[] = [
  ...ostraArtists,
  ...vastraArtists,
  ...nordvastraArtists,
  ...mittskaneArtists,
  ...sydvastraArtists,
];

// Re-export for backwards compatibility
export const artists = allArtists;
