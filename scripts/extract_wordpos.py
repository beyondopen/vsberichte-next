#!/usr/bin/env python3
"""Extract word bounding boxes from PDFs and save as compressed JSON files."""
import argparse
import gzip
import json
import os
from pathlib import Path

import pdfplumber

DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
PDF_DIR = DATA_DIR / "pdfs"
WORDPOS_DIR = DATA_DIR / "wordpos"


def extract_word_positions(pdf_path, wordpos_dir=None):
    """Extract word bounding boxes from a PDF and save as compressed JSON files."""
    if wordpos_dir is None:
        wordpos_dir = WORDPOS_DIR
    wordpos_dir = Path(wordpos_dir)
    wordpos_dir.mkdir(parents=True, exist_ok=True)

    pdf_stem = pdf_path.stem

    try:
        pdf = pdfplumber.open(pdf_path)
    except Exception as e:
        print(f"  Warning: cannot open {pdf_path.name} with pdfplumber: {e}")
        return

    with pdf:
        for page_index, page in enumerate(pdf.pages):
            try:
                words = page.extract_words(
                    keep_blank_chars=False, x_tolerance=3, y_tolerance=3
                )
            except Exception:
                continue

            page_w = float(page.width)
            page_h = float(page.height)

            normalized_words = []
            for w in words:
                normalized_words.append(
                    {
                        "t": w["text"],
                        "x": round(w["x0"] / page_w, 5),
                        "y": round(w["top"] / page_h, 5),
                        "w": round((w["x1"] - w["x0"]) / page_w, 5),
                        "h": round((w["bottom"] - w["top"]) / page_h, 5),
                    }
                )

            out_path = wordpos_dir / f"{pdf_stem}_{page_index}.json.gz"
            data = json.dumps(
                {"page_width": page_w, "page_height": page_h, "words": normalized_words},
                separators=(",", ":"),
            )

            with gzip.open(out_path, "wt", encoding="utf-8") as f:
                f.write(data)


def main():
    parser = argparse.ArgumentParser(
        description="Extract word positions from PDFs"
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
        help="Regenerate existing word positions",
    )
    args = parser.parse_args()

    WORDPOS_DIR.mkdir(parents=True, exist_ok=True)

    for pdf_path in sorted(PDF_DIR.glob(args.pattern + ".pdf")):
        # Skip English, kurzfassung, and parliamentary files
        if (
            pdf_path.stem.endswith("_en")
            or pdf_path.stem.endswith("kurzfassung")
            or pdf_path.stem.endswith("_parl")
        ):
            continue

        if not args.force:
            first_file = WORDPOS_DIR / f"{pdf_path.stem}_0.json.gz"
            if first_file.exists():
                continue

        print(f"Extracting word positions: {pdf_path.name}")
        extract_word_positions(pdf_path)

    print("Done.")


if __name__ == "__main__":
    main()
