"""
Geocode all artist addresses using Google Geocoding API.
Updates src/data/artists.ts with verified lat/lng coordinates.

Usage: python scripts/geocode_addresses.py
Requires: GOOGLE_GEOCODING_API_KEY in .env.local
"""

import json
import os
import re
import sys
import time

# Fix Windows console encoding
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import requests
from dotenv import load_dotenv

# Load API key from .env.local
load_dotenv(".env.local")
API_KEY = os.getenv("GOOGLE_GEOCODING_API_KEY")

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

# Path to the artists data
ARTISTS_TS = "src/data/artists.ts"
OUTPUT_JSON = "scripts/geocoded_results.json"


def extract_artists_from_ts() -> list[dict]:
    """Parse artists.ts and extract address + location for each artist."""
    with open(ARTISTS_TS, "r", encoding="utf-8") as f:
        content = f.read()

    artists = []
    # Match each artist object block
    pattern = r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)".*?address:\s*"([^"]+)".*?location:\s*"([^"]+)".*?lat:\s*([\d.]+),\s*lng:\s*([\d.]+)'
    for match in re.finditer(pattern, content, re.DOTALL):
        artists.append({
            "id": int(match.group(1)),
            "name": match.group(2),
            "address": match.group(3),
            "location": match.group(4),
            "current_lat": float(match.group(5)),
            "current_lng": float(match.group(6)),
        })
    return artists


def geocode_address(address: str, location: str) -> dict | None:
    """Geocode a single address using Google Geocoding API."""
    # Clean address for geocoding (remove studio names etc.)
    clean_addr = address
    # Remove prefixes like "Ateljé Brännorna, " or "Galleri Blå, "
    if "," in clean_addr:
        parts = clean_addr.split(",")
        # If first part looks like a place name (no numbers), skip it
        if not any(c.isdigit() for c in parts[0]) and len(parts) > 1:
            clean_addr = ",".join(parts[1:]).strip()

    query = f"{clean_addr}, {location}, Skåne, Sweden"

    params = {
        "address": query,
        "key": API_KEY,
        "region": "se",
        "language": "sv",
    }

    resp = requests.get(GEOCODE_URL, params=params, timeout=10)
    data = resp.json()

    if data["status"] == "OK" and data["results"]:
        result = data["results"][0]
        loc = result["geometry"]["location"]
        return {
            "lat": round(loc["lat"], 6),
            "lng": round(loc["lng"], 6),
            "formatted_address": result["formatted_address"],
            "confidence": result["geometry"]["location_type"],
        }
    return None


def main():
    if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
        print("❌ Set GOOGLE_GEOCODING_API_KEY in .env.local first!")
        return

    artists = extract_artists_from_ts()
    print(f"📍 Geocoding {len(artists)} artists...")

    results = {}
    for i, artist in enumerate(artists):
        print(f"  [{i+1}/{len(artists)}] {artist['name']}...", end=" ")

        geo = geocode_address(artist["address"], artist["location"])
        if geo:
            # Check if the geocoded result is reasonable (within Skåne region)
            if 55.2 < geo["lat"] < 56.5 and 13.0 < geo["lng"] < 14.8:
                results[artist["id"]] = {
                    **artist,
                    "new_lat": geo["lat"],
                    "new_lng": geo["lng"],
                    "formatted_address": geo["formatted_address"],
                    "confidence": geo["confidence"],
                }
                diff_m = (
                    ((artist["current_lat"] - geo["lat"]) ** 2 + (artist["current_lng"] - geo["lng"]) ** 2)
                    ** 0.5
                    * 111000  # rough m per degree
                )
                status = "✅" if diff_m < 2000 else f"⚠️ ({diff_m:.0f}m diff)"
                print(f"{status} → {geo['formatted_address'][:60]}")
            else:
                print(f"❌ Outside Skåne region: {geo['lat']}, {geo['lng']}")
                results[artist["id"]] = {**artist, "error": "outside_region"}
        else:
            print("❌ No result")
            results[artist["id"]] = {**artist, "error": "no_result"}

        time.sleep(0.1)  # Rate limiting

    # Save results
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Summary
    ok = sum(1 for r in results.values() if "new_lat" in r)
    print(f"\n✅ Successfully geocoded: {ok}/{len(artists)}")
    print(f"📄 Results saved to {OUTPUT_JSON}")
    print("💡 Review results and update artists.ts coordinates if needed.")


if __name__ == "__main__":
    main()
