"""
Scrape representative images from artist websites.
Looks for og:image, twitter:image, or first large image on the page.

Usage: python scripts/scrape_images.py
"""

import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO

ARTISTS_TS = "src/data/artists.ts"
OUTPUT_DIR = Path("public/images/artists")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
TIMEOUT = 10
MIN_IMAGE_SIZE = 200  # Minimum width/height in pixels


def extract_artists_from_ts() -> list[dict]:
    """Parse artists.ts to get id, name, website."""
    with open(ARTISTS_TS, "r", encoding="utf-8") as f:
        content = f.read()

    artists = []
    blocks = re.findall(r"\{[^}]+id:\s*(\d+)[^}]+name:\s*\"([^\"]+)\"[^}]*(?:website:\s*\"([^\"]+)\")?[^}]*\}", content, re.DOTALL)
    for match in blocks:
        aid, name = int(match[0]), match[1]
        website = match[2] if match[2] else None
        artists.append({"id": aid, "name": name, "website": website})
    return artists


def find_image_url(url: str) -> str | None:
    """Find the best representative image on a webpage."""
    try:
        resp = requests.get(f"https://{url}", headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
    except Exception as e:
        print(f"    ❌ Could not fetch {url}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")
    base_url = resp.url

    # 1. Check og:image
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        return urljoin(base_url, og["content"])

    # 2. Check twitter:image
    tw = soup.find("meta", attrs={"name": "twitter:image"})
    if tw and tw.get("content"):
        return urljoin(base_url, tw["content"])

    # 3. Find first large image
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if not src:
            continue
        src = urljoin(base_url, src)
        # Skip tiny images, icons, logos
        if any(skip in src.lower() for skip in ["logo", "icon", "favicon", "pixel", "1x1", "tracking"]):
            continue
        # Check if width/height attributes suggest it's large enough
        w = img.get("width", "")
        h = img.get("height", "")
        if w and w.isdigit() and int(w) < MIN_IMAGE_SIZE:
            continue
        if h and h.isdigit() and int(h) < MIN_IMAGE_SIZE:
            continue
        return src

    return None


def download_and_resize(url: str, output_path: Path, max_size: int = 600) -> bool:
    """Download image, resize, and save as JPEG."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()

        img = Image.open(BytesIO(resp.content))
        img = img.convert("RGB")

        # Skip if too small
        if img.width < MIN_IMAGE_SIZE or img.height < MIN_IMAGE_SIZE:
            return False

        # Resize maintaining aspect ratio
        img.thumbnail((max_size, max_size), Image.LANCZOS)
        img.save(output_path, "JPEG", quality=85)
        return True
    except Exception as e:
        print(f"    ❌ Download failed: {e}")
        return False


def generate_placeholder(artist_id: int, name: str, output_path: Path):
    """Generate a simple placeholder image with initials."""
    img = Image.new("RGB", (400, 400), color=(180, 83, 9))  # accent color

    # We can't easily add text without ImageDraw fonts, so just save solid color
    img.save(output_path, "JPEG", quality=85)


def main():
    artists = extract_artists_from_ts()
    print(f"🖼️  Scraping images for {len(artists)} artists...\n")

    results = {"found": 0, "placeholder": 0, "failed": 0}

    for i, artist in enumerate(artists):
        output_path = OUTPUT_DIR / f"{artist['id']}.jpg"

        # Skip if already exists
        if output_path.exists():
            print(f"  [{i+1}/{len(artists)}] {artist['name']} — already exists, skipping")
            results["found"] += 1
            continue

        print(f"  [{i+1}/{len(artists)}] {artist['name']}...", end=" ")

        if artist["website"]:
            img_url = find_image_url(artist["website"])
            if img_url:
                if download_and_resize(img_url, output_path):
                    print(f"✅ Saved from {artist['website']}")
                    results["found"] += 1
                    time.sleep(0.5)
                    continue

        # Generate placeholder
        generate_placeholder(artist["id"], artist["name"], output_path)
        print("📎 Placeholder generated")
        results["placeholder"] += 1
        time.sleep(0.3)

    print(f"\n📊 Results:")
    print(f"   ✅ Images found: {results['found']}")
    print(f"   📎 Placeholders: {results['placeholder']}")
    print(f"   ❌ Failed: {results['failed']}")


if __name__ == "__main__":
    main()
