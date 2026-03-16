#!/usr/bin/env bash
set -euo pipefail

echo "=== Seeding development database ==="

# Step 1: Run Payload migrations (creates all tables: CMS + search)
echo "Step 1: Running migrations..."
mise exec -- npx payload migrate

# Step 2: Create fake PDFs
echo "Step 2: Creating seed PDFs..."
docker compose run --rm cli python create_seed_pdf.py

# Step 3: Ingest via legacy mode (filename parsing)
# In production, documents would be created via Payload admin UI
echo "Step 3: Ingesting seed documents..."
docker compose run --rm cli python ingest.py "*seed*"

echo ""
echo "=== Seed complete! ==="
