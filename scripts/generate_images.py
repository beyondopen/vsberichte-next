#!/usr/bin/env python3
"""Generate PNG page images from PDFs.

Next.js <Image> handles optimization (WebP/AVIF) on the fly,
so we only store lossless PNGs as the source format.
"""
import argparse
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pdftotext
from pdf2image import convert_from_path
from PIL import Image

DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
PDF_DIR = DATA_DIR / "pdfs"
IMAGES_DIR = DATA_DIR / "images"


def convert_pdf_to_images(pdf_path, dpi=150):
    """Convert entire PDF to images at once (much faster than per-page)."""
    return convert_from_path(str(pdf_path), dpi=dpi)


def save_page_image(img, pdf_stem, page_index, images_dir=None):
    """Save a single page image as PNG at 900px width.

    Returns the path of the saved PNG file.
    """
    if images_dir is None:
        images_dir = IMAGES_DIR
    images_dir = Path(images_dir)

    basewidth = 900
    if img.size[0] > basewidth:
        wpercent = basewidth / float(img.size[0])
        hsize = int(float(img.size[1]) * wpercent)
        img = img.resize((basewidth, hsize), Image.Resampling.LANCZOS)

    png_path = str(images_dir / f"{pdf_stem}_{page_index}.png")
    img.save(png_path, "PNG", optimize=True)

    return png_path


def main():
    parser = argparse.ArgumentParser(
        description="Generate PNG images from PDFs"
    )
    parser.add_argument(
        "pattern",
        nargs="?",
        default="*",
        help="Glob pattern for PDF filenames (default: '*')",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate existing images",
    )
    args = parser.parse_args()

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    for pdf_path in sorted(PDF_DIR.glob(args.pattern + ".pdf")):
        with open(pdf_path, "rb") as f:
            pdf = pdftotext.PDF(f)
            num_pages = len(pdf)

        pages_to_generate = []
        for i in range(num_pages):
            png_path = IMAGES_DIR / f"{pdf_path.stem}_{i}.png"
            if args.force or not png_path.exists():
                pages_to_generate.append(i)

        if not pages_to_generate:
            continue

        print(f"Processing {pdf_path.name} ({len(pages_to_generate)} pages)")
        page_images = convert_pdf_to_images(pdf_path)

        with ThreadPoolExecutor() as executor:
            futures = [
                executor.submit(save_page_image, page_images[i], pdf_path.stem, i)
                for i in pages_to_generate
            ]
            for f in futures:
                f.result()

    print("Done.")


if __name__ == "__main__":
    main()
