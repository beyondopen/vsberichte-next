#!/usr/bin/env python3
"""Ingest PDFs into the database: extract text, generate images, extract word positions.

Two modes:
  CMS mode (default):   python ingest.py --process-pending
  Legacy/direct mode:   python ingest.py '*'
"""
import argparse
import os
import re
import tempfile
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cleantext
import pdftotext
import requests
import spacy
from pdf2image import convert_from_path
from PIL import Image

import psycopg2

from generate_images import convert_pdf_to_images, save_page_image
from extract_wordpos import extract_word_positions
from report_info import report_info

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5433/postgres"
)
DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
PDF_DIR = DATA_DIR / "pdfs"

nlp = spacy.blank("de")

# Regex to join hyphenated words split across lines
regex_join_words = re.compile(r"(?<=\S\S)-\s+(?=\S{2,})")


def count_tokens(texts):
    """Count tokens across multiple texts using spaCy's German tokenizer."""
    c = Counter()
    for d in nlp.tokenizer.pipe(texts):
        c.update([str(t).lower() for t in d])
    return c


def special_pdf_preproc(s):
    """Join hyphenated words that were split across lines."""
    s = regex_join_words.sub("", s)
    return s


def classify_document_type(filename):
    """Determine document_type from filename patterns."""
    stem = Path(filename).stem.lower()
    if "kurzfassung" in stem:
        return "kurzfassung"
    if "_en" in stem or stem.endswith("-en"):
        return "english"
    if "_parl" in stem or stem.endswith("-parl"):
        return "parlamentarisch"
    if "lagebild" in stem:
        return "lagebild"
    if "broschuere" in stem:
        return "broschuere"
    return "jahresbericht"


def process_pdf(pdf_path, conn, document_type="jahresbericht", payload_id=None,
                jurisdiction=None, year=None, title=None):
    """Process a single PDF: extract text, generate images, store in DB.

    Args:
        pdf_path: Path to the PDF file.
        conn: psycopg2 connection.
        document_type: Type of document.
        payload_id: Optional Payload CMS document ID.
        jurisdiction: Explicit jurisdiction (CMS mode). If None, parsed from filename.
        year: Explicit year (CMS mode). If None, parsed from filename.
        title: Explicit title (CMS mode). If None, auto-generated.
    """
    # Parse jurisdiction from filename if not provided
    if jurisdiction is None:
        jurisdiction = "Bund"
        for [a, b] in report_info["abr"]:
            if a.lower() == str(pdf_path.name.split("-")[1]):
                jurisdiction = b

    # Parse year from filename if not provided
    if year is None:
        parts = re.split(r"[-_]", pdf_path.stem)
        for part in reversed(parts):
            try:
                val = int(part)
                if 1900 <= val <= 2100:
                    year = val
                    break
            except ValueError:
                continue
        if year is None:
            print(f"Skipping {pdf_path.name}: cannot parse year from filename")
            return None

    if title is None:
        title = f"Verfassungsschutzbericht {year}"

    print(f"Processing {pdf_path.name} (type={document_type})")

    cur = conn.cursor()

    # Insert or update document row
    if payload_id is not None:
        # CMS mode: upsert by payload_id
        cur.execute(
            """INSERT INTO document (year, jurisdiction, title, file_url, num_pages, document_type, payload_id)
               VALUES (%s, %s, %s, %s, NULL, %s, %s)
               ON CONFLICT (file_url) DO UPDATE SET
                   document_type = EXCLUDED.document_type,
                   payload_id = EXCLUDED.payload_id
               RETURNING id""",
            (year, jurisdiction, title, "/pdfs/" + pdf_path.name,
             document_type, payload_id),
        )
    else:
        cur.execute(
            """INSERT INTO document (year, jurisdiction, title, file_url, num_pages, document_type)
               VALUES (%s, %s, %s, %s, NULL, %s)
               RETURNING id""",
            (year, jurisdiction, title, "/pdfs/" + pdf_path.name,
             document_type),
        )
    doc_id = cur.fetchone()[0]
    conn.commit()

    # Convert all PDF pages to images at once (much faster than per-page)
    page_images = convert_pdf_to_images(pdf_path)

    with open(pdf_path, "rb") as f:
        pdf = pdftotext.PDF(f)
        texts = []

        # Extract text from all pages
        for page_text in pdf:
            page_text = cleantext.clean(
                page_text, lang="de", lower=False, no_line_breaks=True
            )
            page_text = special_pdf_preproc(page_text)
            texts.append(page_text)

        num_pages = len(texts)

        # Save page images as PNG in parallel
        images_dir = DATA_DIR / "images"
        with ThreadPoolExecutor() as executor:
            futures = [
                executor.submit(save_page_image, page_images[i], pdf_path.stem, i, images_dir)
                for i in range(num_pages)
            ]
            image_paths = [f.result() for f in futures]

        # Insert document pages
        for i, (page_text, img_path) in enumerate(zip(texts, image_paths)):
            print(f"  page {i}")
            file_url = img_path.replace(str(DATA_DIR), "")
            cur.execute(
                """INSERT INTO document_page (document_id, page_number, content, file_url)
                   VALUES (%s, %s, %s, %s)""",
                (doc_id, i + 1, page_text, file_url),
            )

        # Count tokens and insert
        counts = count_tokens(texts)
        for token, count in counts.items():
            cur.execute(
                """INSERT INTO token_count (document_id, token, count)
                   VALUES (%s, %s, %s)""",
                (doc_id, token, count),
            )

    # Update num_pages on the document
    cur.execute(
        "UPDATE document SET num_pages = %s WHERE id = %s",
        (num_pages, doc_id),
    )
    conn.commit()

    # Extract word positions
    extract_word_positions(pdf_path, DATA_DIR / "wordpos")

    return num_pages


# ---------------------------------------------------------------------------
# CMS (Payload) mode
# ---------------------------------------------------------------------------

def payload_api(base_url, api_key, method, path, json=None):
    """Make an authenticated request to the Payload REST API."""
    headers = {}
    if api_key:
        # Support both JWT tokens (start with 'eyJ') and API keys
        if api_key.startswith("eyJ"):
            headers["Authorization"] = f"JWT {api_key}"
        else:
            headers["Authorization"] = f"users API-Key {api_key}"
    url = f"{base_url}{path}"
    resp = requests.request(method, url, headers=headers, json=json, timeout=30)
    resp.raise_for_status()
    return resp.json()


def process_pending_from_payload(payload_url, api_key, conn):
    """Fetch pending documents from Payload CMS and process them."""
    print(f"Querying Payload at {payload_url} for pending documents...")

    data = payload_api(
        payload_url, api_key, "GET",
        "/cms/documents?where[processingStatus][equals]=pending&limit=100",
    )

    docs = data.get("docs", [])
    if not docs:
        print("No pending documents found.")
        return

    print(f"Found {len(docs)} pending document(s).")

    for doc in docs:
        doc_id = doc["id"]
        title = doc.get("title", f"Document {doc_id}")
        print(f"\n--- Processing Payload document {doc_id}: {title} ---")

        try:
            # Mark as processing
            payload_api(payload_url, api_key, "PATCH", f"/cms/documents/{doc_id}", json={
                "processingStatus": "processing",
            })

            # Get PDF URL from the document's media relation
            pdf_media = doc.get("pdf")
            if isinstance(pdf_media, dict):
                pdf_url_path = pdf_media.get("url", "")
            else:
                # pdf_media might be an ID; fetch it
                print(f"  Skipping document {doc_id}: no PDF media relation found")
                payload_api(payload_url, api_key, "PATCH", f"/cms/documents/{doc_id}", json={
                    "processingStatus": "error",
                    "processingError": "No PDF media relation found",
                })
                continue

            if not pdf_url_path:
                print(f"  Skipping document {doc_id}: empty PDF URL")
                payload_api(payload_url, api_key, "PATCH", f"/cms/documents/{doc_id}", json={
                    "processingStatus": "error",
                    "processingError": "Empty PDF URL",
                })
                continue

            # Build full PDF download URL
            if pdf_url_path.startswith("http"):
                pdf_download_url = pdf_url_path
            else:
                pdf_download_url = f"{payload_url}{pdf_url_path}"

            # Download PDF to temp file
            print(f"  Downloading PDF from {pdf_download_url}")
            headers = {}
            if api_key:
                headers["Authorization"] = f"users API-Key {api_key}"
            pdf_resp = requests.get(pdf_download_url, headers=headers, timeout=120)
            pdf_resp.raise_for_status()

            # Also save to PDF_DIR for serving
            filename = doc.get("slug", f"document-{doc_id}") + ".pdf"
            pdf_dest = PDF_DIR / filename
            PDF_DIR.mkdir(parents=True, exist_ok=True)
            pdf_dest.write_bytes(pdf_resp.content)

            # Also write to a temp file for processing
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp.write(pdf_resp.content)
                tmp_path = Path(tmp.name)

            try:
                document_type = doc.get("documentType", "jahresbericht")
                num_pages = process_pdf(
                    pdf_dest, conn,
                    document_type=document_type,
                    payload_id=doc_id,
                )

                # Update Payload with results
                payload_api(payload_url, api_key, "PATCH", f"/cms/documents/{doc_id}", json={
                    "numPages": num_pages,
                    "processingStatus": "completed",
                })
                print(f"  Completed: {num_pages} pages")

            finally:
                tmp_path.unlink(missing_ok=True)

        except Exception as e:
            print(f"  ERROR processing document {doc_id}: {e}")
            conn.rollback()
            try:
                payload_api(payload_url, api_key, "PATCH", f"/cms/documents/{doc_id}", json={
                    "processingStatus": "error",
                    "processingError": str(e)[:500],
                })
            except Exception as patch_err:
                print(f"  Could not update error status: {patch_err}")


# ---------------------------------------------------------------------------
# Legacy mode (filename-based)
# ---------------------------------------------------------------------------

def process_legacy(pattern, conn):
    """Process PDFs matching a glob pattern using filename-based metadata."""
    for pdf_path in sorted(PDF_DIR.glob(pattern + ".pdf")):
        try:
            document_type = classify_document_type(pdf_path.name)
            process_pdf(pdf_path, conn, document_type=document_type)
        except Exception as e:
            print(f"{pdf_path.name}  error, already added?")
            print(e)
            conn.rollback()


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Ingest PDFs into the database")
    parser.add_argument(
        "pattern",
        nargs="?",
        default=None,
        help="Glob pattern for legacy mode (filename parsing)",
    )
    parser.add_argument(
        "--payload-url",
        default=os.environ.get("PAYLOAD_URL", "http://localhost:3000"),
        help="Payload CMS base URL (default: PAYLOAD_URL env or http://localhost:3000)",
    )
    parser.add_argument(
        "--payload-api-key",
        default=os.environ.get("PAYLOAD_API_KEY", ""),
        help="Payload CMS API key (default: PAYLOAD_API_KEY env)",
    )
    parser.add_argument(
        "--process-pending",
        action="store_true",
        help="Process all pending documents from Payload CMS",
    )
    args = parser.parse_args()

    images_dir = DATA_DIR / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    conn = psycopg2.connect(DATABASE_URL)

    if args.pattern:
        # Legacy mode: process PDFs by glob pattern
        print(f"Legacy mode: processing PDFs matching '{args.pattern}'")
        process_legacy(args.pattern, conn)
    elif args.process_pending:
        # CMS mode: process pending documents from Payload
        if not args.payload_api_key:
            print("WARNING: No PAYLOAD_API_KEY set. API writes may fail.")
        process_pending_from_payload(args.payload_url, args.payload_api_key, conn)
    else:
        # Default: try CMS mode if API key is available, otherwise show help
        if args.payload_api_key:
            process_pending_from_payload(args.payload_url, args.payload_api_key, conn)
        else:
            print("No pattern or --process-pending specified, and no PAYLOAD_API_KEY set.")
            print("Usage:")
            print("  Legacy mode:  python ingest.py '*'")
            print("  CMS mode:     python ingest.py --process-pending --payload-api-key KEY")
            print("  CMS mode:     PAYLOAD_API_KEY=key python ingest.py --process-pending")

    conn.close()
    print("Done.")


if __name__ == "__main__":
    main()
