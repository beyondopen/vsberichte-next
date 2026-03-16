#!/usr/bin/env python3
"""Create ZIP archives of all PDFs and text exports."""
import argparse
import os
import shutil
import zipfile
from pathlib import Path

import psycopg2

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5433/postgres"
)
DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
PDF_DIR = DATA_DIR / "pdfs"
ZIP_DIR = DATA_DIR / "zips"


def _build_pdf_zip(force):
    """Build ZIP archive of all PDFs."""
    ZIP_DIR.mkdir(parents=True, exist_ok=True)
    dest = ZIP_DIR / "vsberichte.zip"
    tmp = ZIP_DIR / "vsberichte.zip.tmp"

    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    disk_files = {p.name: p.stat().st_size for p in pdfs}

    existing = {}
    needs_rebuild = force or not dest.exists()

    if not needs_rebuild:
        with zipfile.ZipFile(str(dest), "r") as zf:
            existing = {i.filename: i.file_size for i in zf.infolist()}
        # Check if any zip entry was deleted or changed on disk
        for name, size in existing.items():
            if disk_files.get(name) != size:
                needs_rebuild = True
                break

    if needs_rebuild:
        # Full rebuild
        if tmp.exists():
            tmp.unlink()
        with zipfile.ZipFile(str(tmp), "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for pdf in pdfs:
                zf.write(str(pdf), pdf.name)
        shutil.move(str(tmp), str(dest))
        print(f"PDF ZIP: {len(pdfs)} files (rebuilt)")
    else:
        new_files = [p for p in pdfs if p.name not in existing]
        if not new_files:
            print(f"PDF ZIP: {len(existing)} files (up to date)")
            return
        # Append only new files
        with zipfile.ZipFile(str(dest), "a") as zf:
            for pdf in new_files:
                zf.write(str(pdf), pdf.name)
        print(f"PDF ZIP: {len(existing) + len(new_files)} files ({len(new_files)} new)")


def _build_text_zip():
    """Build ZIP archive of text exports from the database."""
    ZIP_DIR.mkdir(parents=True, exist_ok=True)
    dest = ZIP_DIR / "vsberichte-texts.zip"
    tmp = ZIP_DIR / "vsberichte-texts.zip.tmp"

    if tmp.exists():
        tmp.unlink()

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Fetch all documents ordered by jurisdiction and year
    cur.execute(
        "SELECT id, file_url FROM document ORDER BY jurisdiction, year"
    )
    docs = cur.fetchall()

    total = 0
    with zipfile.ZipFile(str(tmp), "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for doc_id, file_url in docs:
            # Fetch page content for this document, ordered by page number
            cur.execute(
                "SELECT content FROM document_page WHERE document_id = %s ORDER BY page_number",
                (doc_id,),
            )
            pages = cur.fetchall()
            text = "\n\n\n".join([p[0] for p in pages])
            fname = Path(file_url).stem + ".txt"
            zf.writestr(fname, text)
            total += 1

    cur.close()
    conn.close()

    shutil.move(str(tmp), str(dest))
    print(f"Text ZIP: {total} files")


def main():
    parser = argparse.ArgumentParser(
        description="Create ZIP archives of all PDFs and text exports"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Rebuild from scratch",
    )
    parser.add_argument(
        "--pdfs",
        action="store_true",
        default=True,
        dest="pdfs",
        help="Build PDF ZIP (default: yes)",
    )
    parser.add_argument(
        "--no-pdfs",
        action="store_false",
        dest="pdfs",
        help="Skip PDF ZIP",
    )
    parser.add_argument(
        "--texts",
        action="store_true",
        default=True,
        dest="texts",
        help="Build text ZIP (default: yes)",
    )
    parser.add_argument(
        "--no-texts",
        action="store_false",
        dest="texts",
        help="Skip text ZIP",
    )
    args = parser.parse_args()

    if args.pdfs:
        print("Building PDF ZIP...")
        _build_pdf_zip(args.force)
    if args.texts:
        print("Building text ZIP...")
        _build_text_zip()

    # Fix ownership when running as root (e.g. in Docker) so the web
    # process can serve the files consistently.
    if os.getuid() == 0 and ZIP_DIR.exists():
        stat = DATA_DIR.stat()
        for f in ZIP_DIR.iterdir():
            os.chown(f, stat.st_uid, stat.st_gid)
        os.chown(ZIP_DIR, stat.st_uid, stat.st_gid)

    print("Done.")


if __name__ == "__main__":
    main()
