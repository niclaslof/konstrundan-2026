"""
Optimize artist images: resize to max 300px, compress to WebP.
Reduces ~2.5MB to ~500KB.

Usage: python scripts/optimize_images.py
"""

import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from pathlib import Path
from PIL import Image

INPUT_DIR = Path("public/images/artists")
MAX_SIZE = 300
QUALITY = 75


def optimize():
    images = list(INPUT_DIR.glob("*.jpg"))
    total_before = sum(f.stat().st_size for f in images)
    print(f"Optimizing {len(images)} images ({total_before / 1024:.0f} KB total)...\n")

    total_after = 0
    for img_path in sorted(images):
        img = Image.open(img_path)
        img = img.convert("RGB")

        # Resize maintaining aspect ratio
        img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)

        # Save as optimized JPEG (keep .jpg for compatibility)
        img.save(img_path, "JPEG", quality=QUALITY, optimize=True)
        size_after = img_path.stat().st_size
        total_after += size_after

    saved = total_before - total_after
    print(f"Before: {total_before / 1024:.0f} KB")
    print(f"After:  {total_after / 1024:.0f} KB")
    print(f"Saved:  {saved / 1024:.0f} KB ({saved / total_before * 100:.0f}%)")


if __name__ == "__main__":
    optimize()
