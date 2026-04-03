"""
Scrape all VSKG (Västra Skåne) artist data from vskg.se.
Outputs src/data/regions/vastra.ts

Usage: python scripts/scrape_vskg.py
"""

import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import re
import time
import requests
from bs4 import BeautifulSoup

LISTING_URL = "https://vskg.se/konstrundan/konstnarer-som-deltager/"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
OUTPUT_TS = "src/data/regions/vastra.ts"
OUTPUT_JSON = "scripts/vskg_artists.json"


def scrape_listing():
    """Get all artist names, IDs, techniques and links from listing page."""
    r = requests.get(LISTING_URL, headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")

    main = soup.find("div", id="main-content") or soup.find("article")
    links = main.find_all("a", href=True) if main else []

    artists = []
    for link in links:
        href = link["href"]
        if "/artists/" not in href:
            continue
        text = link.get_text(strip=True)
        # Parse "6 Charlotta Höglund"
        match = re.match(r"(\d+)\s+(.+)", text)
        if match:
            aid = int(match.group(1))
            name = match.group(2).strip()

            # Get technique from siblings
            technique_parts = []
            sibling = link.parent
            if sibling:
                spans = sibling.find_all("span") or sibling.find_all("a")
                for s in spans:
                    t = s.get_text(strip=True)
                    if t and t != text and t not in [",", ""] and not t[0].isdigit():
                        technique_parts.append(t)

            # Fallback: get text after the link
            if not technique_parts and sibling:
                full_text = sibling.get_text(strip=True)
                after_name = full_text.replace(text, "").strip()
                if after_name:
                    technique_parts = [p.strip() for p in after_name.split(",") if p.strip()]

            artists.append({
                "id": aid,
                "name": name,
                "technique": ", ".join(technique_parts) if technique_parts else "KONST",
                "url": href,
            })

    return artists


def scrape_artist_page(url):
    """Scrape individual artist page for contact details."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        return {}

    data = {}
    text = soup.get_text(separator="\n", strip=True)

    # Phone pattern
    phone_match = re.search(r"(?:Tel|Telefon|Mobil)[:\s]*([\d\s-]{8,})", text, re.IGNORECASE)
    if phone_match:
        data["phone"] = phone_match.group(1).strip()
    else:
        # Try common Swedish phone patterns
        phone_match = re.search(r"(0\d{1,3}[-\s]?\d{2,3}[-\s]?\d{2}[-\s]?\d{2})", text)
        if phone_match:
            data["phone"] = phone_match.group(1).strip()

    # Email
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text)
    if email_match:
        data["email"] = email_match.group(0)

    # Website (not vskg.se or instagram)
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "http" in href and "vskg.se" not in href and "instagram" not in href and "facebook" not in href and "google" not in href:
            # Likely artist website
            if any(x in href for x in [".se", ".com", ".nu", ".org", ".net"]):
                data["website"] = href.replace("https://", "").replace("http://", "").rstrip("/")
                break

    # Instagram
    for a in soup.find_all("a", href=True):
        if "instagram.com" in a["href"]:
            ig = a["href"].split("instagram.com/")[-1].strip("/").split("?")[0]
            if ig:
                data["instagram"] = ig
            break

    # Address - look for common patterns
    addr_match = re.search(r"(?:Adress|Atelj[eé])[:\s]*([^\n]+)", text, re.IGNORECASE)
    if addr_match:
        data["address"] = addr_match.group(1).strip()
    else:
        # Try to find address patterns (streetname + number)
        addr_match = re.search(r"(\w+(?:vägen|gatan|väg|gata|stigen|backe)\s+\d+[A-Za-z]?(?:,\s*\d{3}\s*\d{2}\s*\w+)?)", text)
        if addr_match:
            data["address"] = addr_match.group(1).strip()

    # Location/city
    city_match = re.search(r"\d{3}\s?\d{2}\s+(\w+)", text)
    if city_match:
        data["location"] = city_match.group(1).strip()

    # Image
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "uploads" in src and "150x150" not in src:
            data["imageUrl"] = src
            break

    return data


def main():
    print("Scraping VSKG (Västra Skåne) artists...")

    artists = scrape_listing()
    print(f"Found {len(artists)} artists on listing page.\n")

    all_data = []
    for i, artist in enumerate(artists):
        print(f"  [{i+1}/{len(artists)}] {artist['name']}...", end=" ")
        details = scrape_artist_page(artist["url"])

        entry = {
            "id": artist["id"],
            "name": artist["name"],
            "technique": artist["technique"],
            "phone": details.get("phone", ""),
            "email": details.get("email"),
            "website": details.get("website"),
            "instagram": details.get("instagram"),
            "address": details.get("address", ""),
            "location": details.get("location", "Västra Skåne"),
        }
        all_data.append(entry)
        found = [k for k, v in details.items() if v]
        print(f"({', '.join(found) if found else 'basic only'})")
        time.sleep(0.3)

    # Save JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(all_data)} artists to {OUTPUT_JSON}")

    # Generate TypeScript file
    generate_ts(all_data)
    print(f"Generated {OUTPUT_TS}")


def generate_ts(artists):
    """Generate the TypeScript data file."""
    lines = ['import { Artist } from "@/lib/types";\n']
    lines.append("export const vastraArtists: Artist[] = [")

    for a in artists:
        lines.append("  {")
        lines.append(f'    id: {a["id"]},')
        lines.append(f'    regionId: "vastra",')
        lines.append(f'    name: "{a["name"]}",')
        lines.append(f'    technique: "{a["technique"]}",')
        lines.append(f'    address: "{a.get("address", "")}",')
        lines.append(f'    location: "{a.get("location", "Västra Skåne")}",')
        lines.append(f'    phone: "{a.get("phone", "")}",')
        if a.get("email"):
            lines.append(f'    email: "{a["email"]}",')
        if a.get("website"):
            lines.append(f'    website: "{a["website"]}",')
        if a.get("instagram"):
            lines.append(f'    instagram: "{a["instagram"]}",')
        # Default coordinates for Västra Skåne (will be geocoded later)
        lines.append(f"    lat: 55.60,")
        lines.append(f"    lng: 13.00,")
        lines.append("  },")

    lines.append("];")

    with open(OUTPUT_TS, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
