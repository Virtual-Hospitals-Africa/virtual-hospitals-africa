#!/bin/bash
set -e

REPO_DIR="/home/admin/virtual-hospitals-africa"
BACKUP_DIR="/mnt/pgdata/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== VHA Staging Deployment ==="

# Create backup before deployment
mkdir -p "$BACKUP_DIR"
echo "Backing up database..."
docker exec vha_postgres_staging pg_dump -U vha_admin vha_staging | \
  gzip > "$BACKUP_DIR/vha_staging_$TIMESTAMP.sql.gz"

# Pull latest code
cd "$REPO_DIR"
echo "Pulling latest code..."
git fetch origin
git reset --hard origin/main
git lfs pull

# Rebuild containers
echo "Building containers..."
docker-compose -f docker-compose.staging.yml build --no-cache web

# Stop old containers
echo "Stopping old containers..."
docker-compose -f docker-compose.staging.yml down

# Start new containers
echo "Starting containers..."
docker-compose -f docker-compose.staging.yml up -d

# Wait for database
echo "Waiting for database..."
sleep 5

# Run migrations (if needed)
echo "Running migrations..."
docker-compose -f docker-compose.staging.yml exec -T web \
  deno task db:migrate latest || true

# Warm up SNOMED cache (first time only)
if [ ! -f /mnt/pgdata/.snomed_initialized ]; then
  echo "Initializing SNOMED data (first time)..."
  docker-compose -f docker-compose.staging.yml exec -T web \
    deno task db:seed load 02_snomed_base
  touch /mnt/pgdata/.snomed_initialized
fi

echo "✅ Deployment complete!"
docker-compose -f docker-compose.staging.yml logs web
