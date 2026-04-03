"""
Generate AI artist descriptions using OpenAI GPT-4o-mini.
Scrapes artist websites for bio info, then generates short Swedish descriptions.

Usage: python scripts/generate_descriptions.py
Requires: OPENAI_API_KEY in .env.local
"""

import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import os
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(".env.local")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

REGIONS_DIR = Path("src/data/regions")
OUTPUT_FILE = Path("src/data/descriptions.json")
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}


def scrape_bio(website: str) -> str:
    """Scrape artist website for bio text."""
    if not website:
        return ""
    try:
        url = f"https://{website}" if not website.startswith("http") else website
        r = requests.get(url, headers=HEADERS, timeout=8)
        soup = BeautifulSoup(r.text, "html.parser")
        # Remove nav, footer, script
        for tag in soup(["nav", "footer", "script", "style", "header"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        # Return first 1000 chars
        return text[:1000]
    except Exception:
        return ""


def generate_description(name: str, technique: str, location: str, bio: str) -> str:
    """Generate a short Swedish description using GPT-4o-mini."""
    prompt = f"""Skriv en kort presentation (2-3 meningar) på svenska om konstnären {name}.
Teknik: {technique}
Ort: {location}
{"Bio från hemsida: " + bio[:500] if bio else "Ingen bio tillgänglig."}

Skriv i tredje person. Var informativ och engagerande. Nämn teknik och stil.
Om du inte har tillräcklig info, skriv en generell men professionell presentation baserad på tekniken.
Svara BARA med presentationstexten, inget annat."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"    API error: {e}")
        return ""


def parse_all_artists() -> list[dict]:
    """Parse all region files and extract artist data."""
    artists = []
    for ts_file in REGIONS_DIR.glob("*.ts"):
        region = ts_file.stem
        with open(ts_file, "r", encoding="utf-8") as f:
            content = f.read()
        for m in re.finditer(
            r'id:\s*(\d+).*?regionId:\s*"([^"]*)".*?name:\s*"([^"]*)".*?technique:\s*"([^"]*)".*?location:\s*"([^"]*)"(?:.*?website:\s*"([^"]*)")?',
            content,
            re.DOTALL,
        ):
            artists.append({
                "id": int(m.group(1)),
                "regionId": m.group(2),
                "name": m.group(3),
                "technique": m.group(4),
                "location": m.group(5),
                "website": m.group(6) or "",
            })
    return artists


def main():
    # Load existing descriptions
    existing = {}
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)

    artists = parse_all_artists()
    print(f"Found {len(artists)} artists across all regions")

    # Only generate for artists without descriptions
    to_generate = [a for a in artists if f"{a['regionId']}-{a['id']}" not in existing]
    print(f"Need to generate {len(to_generate)} new descriptions\n")

    for i, a in enumerate(to_generate):
        key = f"{a['regionId']}-{a['id']}"
        print(f"  [{i+1}/{len(to_generate)}] {a['name']}...", end=" ")

        bio = scrape_bio(a["website"])
        desc = generate_description(a["name"], a["technique"], a["location"], bio)

        if desc:
            existing[key] = desc
            print(f"OK ({len(desc)} chars)")
        else:
            print("FAILED")

        # Save progress every 10 artists
        if (i + 1) % 10 == 0:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=2, ensure_ascii=False)

        time.sleep(0.5)  # Rate limiting

    # Final save
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)

    print(f"\nDone! {len(existing)} descriptions saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
