#!/usr/bin/env python3
"""FastAPI HTTP worker for PDF processing.

Called by Payload CMS job queue to process uploaded PDFs.
The worker only reads from Payload (public access) and writes to raw SQL tables.
Status updates (pending → processing → completed/error) are handled by the
Payload job handler in Node.js, not by the worker.
"""
import os
import traceback
from pathlib import Path

import psycopg2
import requests
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from ingest import process_pdf
from extract_wordpos import extract_word_positions

app = FastAPI(title="VSBerichte PDF Worker")

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:password@db:5432/postgres")
DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
PDF_DIR = DATA_DIR / "pdfs"
PAYLOAD_URL = os.environ.get("PAYLOAD_URL", "http://web:3000")


def get_db_conn():
    return psycopg2.connect(DATABASE_URL)


def ensure_dirs():
    (DATA_DIR / "images").mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "wordpos").mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process/{document_id}")
def process_document(document_id: int):
    """Process a single document by Payload CMS ID.

    1. Fetches document metadata from Payload (public read, no auth needed)
    2. Downloads the PDF from Payload media
    3. Processes: text extraction, PNG images, word positions, token counts
    4. Writes to raw SQL tables (document, document_page, token_count)
    5. Returns result — Payload job handler updates CMS status
    """
    ensure_dirs()

    # 1. Fetch document from Payload (public read access)
    try:
        resp = requests.get(f"{PAYLOAD_URL}/cms/documents/{document_id}", timeout=30)
        resp.raise_for_status()
        doc = resp.json()
    except Exception as e:
        return JSONResponse(status_code=502, content={
            "status": "error",
            "message": f"Failed to fetch document from Payload: {e}",
        })

    # 2. Get PDF URL from media relation
    pdf_media = doc.get("pdf")
    if isinstance(pdf_media, dict):
        pdf_url_path = pdf_media.get("url", "")
    else:
        return JSONResponse(status_code=400, content={
            "status": "error",
            "message": "No PDF media relation found",
        })

    if not pdf_url_path:
        return JSONResponse(status_code=400, content={
            "status": "error",
            "message": "Empty PDF URL in document",
        })

    # 3. Download PDF (media read is also public)
    pdf_download_url = pdf_url_path if pdf_url_path.startswith("http") else f"{PAYLOAD_URL}{pdf_url_path}"
    try:
        pdf_resp = requests.get(pdf_download_url, timeout=120)
        pdf_resp.raise_for_status()
    except Exception as e:
        return JSONResponse(status_code=502, content={
            "status": "error",
            "message": f"Failed to download PDF: {e}",
        })

    # Save PDF to data dir
    filename = f"document-{document_id}.pdf"
    pdf_dest = PDF_DIR / filename
    pdf_dest.write_bytes(pdf_resp.content)

    # 4. Process the PDF
    conn = get_db_conn()
    try:
        num_pages = process_pdf(
            pdf_dest, conn,
            document_type=doc.get("documentType", "jahresbericht"),
            payload_id=document_id,
            jurisdiction=doc.get("jurisdiction", "Bund"),
            year=doc.get("year"),
            title=doc.get("title"),
        )
        return {"status": "completed", "numPages": num_pages}

    except Exception as e:
        conn.rollback()
        traceback.print_exc()
        return JSONResponse(status_code=500, content={
            "status": "error",
            "message": str(e)[:500],
        })
    finally:
        conn.close()
