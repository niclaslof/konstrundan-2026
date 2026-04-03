"""
Geocode all artist addresses across all regions using Google Geocoding API.
Reads each region's .ts file, geocodes addresses, and writes back updated coordinates.

Usage: python scripts/geocode_all_regions.py
Requires: GOOGLE_GEOCODING_API_KEY in .env.local
"""

import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import os
import re
import time
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")
API_KEY = os.getenv("GOOGLE_GEOCODING_API_KEY")
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

REGION_FILES = {
    "vastra": "src/data/regions/vastra.ts",
    "nordvastra": "src/data/regions/nordvastra.ts",
    "mittskane": "src/data/regions/mittskane.ts",
    "sydvastra": "src/data/regions/sydvastra.ts",
}

# Default coordinates per region (center of each area) for fallback
REGION_CENTERS = {
    "vastra": (55.58, 13.05),
    "nordvastra": (56.10, 12.75),
    "mittskane": (55.90, 13.55),
    "sydvastra": (55.45, 13.10),
}

# Known city coordinates for when we only have a city name
CITY_COORDS = {
    "malmö": (55.6050, 13.0038),
    "lund": (55.7047, 13.1910),
    "helsingborg": (56.0465, 12.6945),
    "landskrona": (55.8708, 12.8302),
    "höganäs": (56.1996, 12.5584),
    "ängelholm": (56.2428, 12.8622),
    "båstad": (56.4265, 12.8508),
    "höllviken": (55.4110, 12.9560),
    "falsterbo": (55.3836, 12.8280),
    "skanör": (55.4130, 12.8440),
    "vellinge": (55.4720, 13.0210),
    "trelleborg": (55.3761, 13.1571),
    "svedala": (55.5060, 13.2330),
    "ystad": (55.4295, 13.8200),
    "sjöbo": (55.6310, 13.7090),
    "eslöv": (55.8392, 13.3536),
    "höör": (55.9372, 13.5418),
    "hörby": (55.8576, 13.6643),
    "hässleholm": (56.1591, 13.7664),
    "kristianstad": (56.0294, 14.1567),
    "simrishamn": (55.5569, 14.3504),
    "tomelilla": (55.5430, 13.9540),
    "kivik": (55.6850, 14.2310),
    "brösarp": (55.7210, 14.0870),
    "degeberga": (55.8360, 14.0870),
    "lövestad": (55.5750, 13.8550),
    "skillinge": (55.4780, 14.2800),
    "brantevik": (55.5180, 14.3460),
    "borrby": (55.4550, 14.1900),
    "hammenhög": (55.4970, 14.1360),
    "gärsnäs": (55.5480, 14.1750),
    "skurup": (55.4780, 13.4990),
    "anderslöv": (55.4540, 13.3080),
    "bara": (55.5350, 13.1510),
    "bunkeflostrand": (55.5560, 12.9150),
    "limhamn": (55.5830, 12.9350),
    "beddingestrand": (55.3900, 13.2730),
    "klagstorp": (55.3980, 13.2400),
    "svedala": (55.5060, 13.2330),
    "äsperöd": (55.4550, 13.4200),
    "arild": (56.2750, 12.5600),
    "mölle": (56.2830, 12.4960),
    "viken": (56.1560, 12.5810),
    "vejbystrand": (56.3020, 12.7740),
    "munka ljungby": (56.2000, 12.9500),
    "mörarp": (56.0700, 12.7100),
    "ekeby": (55.9800, 12.9800),
    "vallåkra": (55.9600, 12.8200),
    "kågeröd": (55.9900, 13.0800),
    "ljungbyhed": (56.0700, 13.2300),
    "ödåkra": (56.0800, 12.7200),
    "hjärnarp": (56.3500, 12.8500),
    "vejbyslätt": (56.3100, 12.7500),
    "skåne tranås": (55.6160, 13.9970),
}


def geocode_address(address: str, location: str, region: str) -> tuple[float, float] | None:
    """Geocode a single address. Returns (lat, lng) or None."""
    if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
        return None

    # Build search query
    parts = []
    if address:
        # Clean address (remove studio names before comma)
        clean = address
        if "," in clean:
            first, rest = clean.split(",", 1)
            if not any(c.isdigit() for c in first):
                clean = rest.strip()
        parts.append(clean)
    if location:
        parts.append(location)
    parts.append("Skåne, Sweden")

    query = ", ".join(parts)

    try:
        resp = requests.get(
            GEOCODE_URL,
            params={"address": query, "key": API_KEY, "region": "se", "language": "sv"},
            timeout=10,
        )
        data = resp.json()

        if data["status"] == "OK" and data["results"]:
            loc = data["results"][0]["geometry"]["location"]
            lat, lng = loc["lat"], loc["lng"]
            # Verify it's in Skåne region
            if 55.2 < lat < 56.5 and 12.0 < lng < 14.8:
                return (round(lat, 6), round(lng, 6))
    except Exception:
        pass
    return None


def geocode_by_city(location: str) -> tuple[float, float] | None:
    """Fallback: use known city coordinates."""
    if not location:
        return None
    key = location.lower().strip()
    if key in CITY_COORDS:
        # Add small random offset to avoid stacking
        import random
        lat, lng = CITY_COORDS[key]
        lat += random.uniform(-0.005, 0.005)
        lng += random.uniform(-0.005, 0.005)
        return (round(lat, 6), round(lng, 6))
    # Try partial match
    for city, coords in CITY_COORDS.items():
        if city in key or key in city:
            import random
            lat, lng = coords
            lat += random.uniform(-0.005, 0.005)
            lng += random.uniform(-0.005, 0.005)
            return (round(lat, 6), round(lng, 6))
    return None


def parse_ts_file(filepath: str) -> list[dict]:
    """Parse a region's .ts file and extract artist data."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    artists = []
    # Match each object block
    for match in re.finditer(
        r'\{\s*id:\s*(\d+).*?name:\s*"([^"]*)".*?address:\s*"([^"]*)".*?location:\s*"([^"]*)".*?lat:\s*([\d.]+).*?lng:\s*([\d.]+)',
        content,
        re.DOTALL,
    ):
        artists.append({
            "id": int(match.group(1)),
            "name": match.group(2),
            "address": match.group(3),
            "location": match.group(4),
            "lat": float(match.group(5)),
            "lng": float(match.group(6)),
        })
    return artists


def update_ts_file(filepath: str, updates: dict[int, tuple[float, float]]):
    """Update lat/lng in a .ts file for given artist IDs."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    for aid, (lat, lng) in updates.items():
        # Find this artist's block and update coordinates
        pattern = rf"(id:\s*{aid},.*?lat:\s*)[\d.]+(\s*,\s*lng:\s*)[\d.]+"
        content = re.sub(pattern, rf"\g<1>{lat}\g<2>{lng}", content, flags=re.DOTALL, count=1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def process_region(region_id: str, filepath: str):
    """Geocode all artists in a region."""
    print(f"\n{'='*60}")
    print(f"Region: {region_id.upper()} ({filepath})")
    print(f"{'='*60}")

    artists = parse_ts_file(filepath)
    if not artists:
        print("  No artists found in file!")
        return

    center = REGION_CENTERS[region_id]
    updates = {}
    geocoded = 0
    city_fallback = 0
    region_fallback = 0

    for i, a in enumerate(artists):
        # Skip if already has non-default coordinates
        is_default = (
            abs(a["lat"] - center[0]) < 0.01 and abs(a["lng"] - center[1]) < 0.01
        )
        if not is_default:
            print(f"  [{i+1}/{len(artists)}] {a['name']} - already geocoded, skipping")
            continue

        print(f"  [{i+1}/{len(artists)}] {a['name']}...", end=" ")

        # Try Google Geocoding first
        result = None
        if a["address"]:
            result = geocode_address(a["address"], a["location"], region_id)
            if result:
                updates[a["id"]] = result
                geocoded += 1
                print(f"API -> ({result[0]}, {result[1]})")
                time.sleep(0.1)
                continue

        # Try city fallback
        result = geocode_by_city(a["location"])
        if result:
            updates[a["id"]] = result
            city_fallback += 1
            print(f"city -> {a['location']} ({result[0]}, {result[1]})")
            continue

        # Use region center with offset
        import random
        lat = center[0] + random.uniform(-0.08, 0.08)
        lng = center[1] + random.uniform(-0.08, 0.08)
        updates[a["id"]] = (round(lat, 6), round(lng, 6))
        region_fallback += 1
        print(f"fallback -> ({lat:.4f}, {lng:.4f})")

    if updates:
        update_ts_file(filepath, updates)

    print(f"\nResults for {region_id}:")
    print(f"  API geocoded: {geocoded}")
    print(f"  City fallback: {city_fallback}")
    print(f"  Region fallback: {region_fallback}")
    print(f"  Skipped (already done): {len(artists) - geocoded - city_fallback - region_fallback}")


def main():
    if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
        print("WARNING: No API key - using city/region fallbacks only")

    for region_id, filepath in REGION_FILES.items():
        process_region(region_id, filepath)

    print("\n" + "=" * 60)
    print("All regions geocoded!")
    print("=" * 60)


if __name__ == "__main__":
    main()
