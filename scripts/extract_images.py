"""
Extract artist images from the OSKG PDF.
Maps each image to an artist ID based on position on pages 2-3.

Usage: python scripts/extract_images.py
"""

import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from pathlib import Path
import pdfplumber
from PIL import Image
from io import BytesIO

PDF_PATH = "public/OSKG_Karta_2026_low.pdf"
OUTPUT_DIR = Path("public/images/artists")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Artist IDs in order as they appear in the PDF grid (pages 2-3)
# Page 2: 4 columns x 8 rows = 32 artists per page
# Page 3: continues with remaining artists
# Order is left-to-right, top-to-bottom based on PDF layout

# Page 2 artist IDs (in grid order, left to right, top to bottom)
PAGE2_IDS = [
    1, 17, 29, 59,    # Row 1
    2, 18, 30, 66,    # Row 2
    4, 19, 32, 67,    # Row 3
    5, 20, 33, 69,    # Row 4
    6, 21, 39, 71,    # Row 5
    7, 22, 47, 78,    # Row 6
    8, 23, 49, 80,    # Row 7
    11, 25, 52, 85,   # Row 8
    12, 26, 54, 87,   # Row 9
    13, 27, 57, 90,   # Row 10
    16, 28, 58, 93,   # Row 11
]

# Page 3 artist IDs (continuing grid)
PAGE3_IDS = [
    97, 147, 170, 186,    # Row 1
    101, 148, 171, 187,   # Row 2
    102, 149, 173, 188,   # Row 3
    103, 154, 174, 189,   # Row 4
    110, 158, 176, 190,   # Row 5
    116, 160, 178, 191,   # Row 6
    124, 164, 179, 192,   # Row 7
    126, 166, 180, 193,   # Row 8
    138, 167, 182, 194,   # Row 9
    141, 168, 183, None,  # Row 10 (last cell has OSKG info, not artist)
    143, 169, 184, None,  # Row 11
]


def extract_artist_images_from_page(pdf_page, page_num, artist_ids):
    """Extract images from a PDF page and map them to artist IDs."""
    images = pdf_page.images

    # Filter to only substantial images (artist photos, not icons)
    artist_images = [img for img in images if img["width"] > 40 and img["height"] > 40]

    # Sort by position: top to bottom, then left to right
    artist_images.sort(key=lambda img: (round(img["top"] / 50) * 50, img["x0"]))

    print(f"\nPage {page_num}: {len(artist_images)} artist images found, {len([x for x in artist_ids if x])} IDs to map")

    # Get the PDF page as an image for cropping
    # Use pdfplumber's page image
    page_image = pdf_page.to_image(resolution=300)
    pil_image = page_image.original

    # PDF coordinate system: origin at bottom-left, but pdfplumber uses top-left
    page_height = pdf_page.height
    page_width = pdf_page.width
    img_width, img_height = pil_image.size
    scale_x = img_width / page_width
    scale_y = img_height / page_height

    mapped = 0
    for i, img in enumerate(artist_images):
        if i >= len(artist_ids) or artist_ids[i] is None:
            continue

        artist_id = artist_ids[i]

        # Convert PDF coordinates to pixel coordinates
        x0 = int(img["x0"] * scale_x)
        y0 = int(img["top"] * scale_y)
        x1 = int((img["x0"] + img["width"]) * scale_x)
        y1 = int((img["top"] + img["height"]) * scale_y)

        # Crop the image
        cropped = pil_image.crop((x0, y0, x1, y1))

        # Resize to consistent size
        cropped = cropped.convert("RGB")
        cropped.thumbnail((400, 400), Image.LANCZOS)

        output_path = OUTPUT_DIR / f"{artist_id}.jpg"
        cropped.save(output_path, "JPEG", quality=90)
        mapped += 1
        print(f"  #{artist_id} -> {output_path} ({img['width']:.0f}x{img['height']:.0f})")

    return mapped


def main():
    print("Extracting artist images from PDF...")

    total = 0
    with pdfplumber.open(PDF_PATH) as pdf:
        # Page 2 (index 1)
        total += extract_artist_images_from_page(pdf.pages[1], 2, PAGE2_IDS)
        # Page 3 (index 2)
        total += extract_artist_images_from_page(pdf.pages[2], 3, PAGE3_IDS)

    print(f"\nDone! Extracted {total} artist images to {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
