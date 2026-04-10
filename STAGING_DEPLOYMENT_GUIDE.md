# VHA Staging Environment Deployment Guide

## Executive Summary

**Recommendation: Reuse a persistent EC2 instance with Docker containers and EBS volumes**, rather than spinning up new instances. This approach minimizes deployment time, avoids redundant SNOMED data downloads, and provides the fastest iteration cycle for staging work.

---

## Problem Statement

Your project has a significant data initialization cost:
- **SNOMED CT Reference Data**: 547MB compressed, takes time to download and process
- **Database Initialization**: Migrations + seeding can take several minutes
- **Goal**: Fast, efficient staging deployments while maintaining data persistence

---

## Recommended Approach: Persistent EC2 + Docker Containers

### Architecture

```
┌─────────────────────────────────────────────┐
│         AWS EC2 Instance (t3.large)         │
│  Persistent Instance (reused across deploys)│
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Docker Container: Application      │  │
│  │   (Vite built, Fresh framework)      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Docker Container: PostgreSQL        │  │
│  │  (with persistent EBS volume)        │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  EBS Volume 1: Database Data         │  │
│  │  - SNOMED CT indexed + ready to use  │  │
│  │  - Survives container restarts       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  EBS Volume 2: Application Build     │  │
│  │  (optional: cache builds)            │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Docker Volume: Deno Module Cache  │  │
│  │  (avoids re-downloading deps)        │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Why This Approach

| Factor | Reuse EC2 | New EC2 Each Time |
|--------|-----------|-------------------|
| SNOMED data download | ✅ Already cached | ❌ ~5-10 min per deploy |
| Database warm-up | ✅ Persisted | ❌ Full rebuild needed |
| Deploy time | ✅ 2-5 minutes | ❌ 15-25 minutes |
| Cost | ✅ ~$30-50/mo | ❌ ~$100-200/mo (depends on frequency) |
| Reproducibility | ⚠️ Moderate | ✅ Perfect |
| Data isolation | ⚠️ Shared state | ✅ Fresh per deploy |

---

## Implementation Steps

### Phase 1: One-Time EC2 Setup

```bash
#!/bin/bash
# 1. Launch EC2 instance (Debian 12 or Ubuntu 24.04)
# Instance type: t3.large (2 vCPU, 8GB RAM)
# Root EBS: 50GB (GP3)
# Add second EBS: 100GB (GP3) for database volume

# 2. SSH into the instance
ssh -i key.pem admin@<ec2-public-ip>

# 3. Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Configure persistent volumes
sudo mkfs.ext4 /dev/nvme1n1  # Format second EBS volume
sudo mkdir -p /mnt/pgdata
sudo mount /dev/nvme1n1 /mnt/pgdata
sudo chown docker:docker /mnt/pgdata

# Make mount permanent (add to /etc/fstab):
# /dev/nvme1n1 /mnt/pgdata ext4 defaults,nofail 0 2

# 5. Clone repository
git clone https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa.git
cd virtual-hospitals-africa
git lfs pull
```

### Phase 2: Docker Compose Setup for Staging

Create `docker-compose.staging.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL with persistent volume
  postgres:
    image: postgres:16-alpine
    container_name: vha_postgres_staging
    environment:
      POSTGRES_USER: vha_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_MULTIPLE_DATABASES: vha_staging,vha_test
    ports:
      - "5432:5432"
    volumes:
      - /mnt/pgdata:/var/lib/postgresql/data  # Persistent EBS volume
      - ./docker-postgresql-multiple-databases:/docker-entrypoint-initdb.d
    command: >
      postgres
      -c shared_preload_libraries=pg_stat_monitor
      -c pg_stat_monitor.pgsm_query_max_len=2048
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U vha_admin -d vha_staging']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vha-net

  # Application container
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: vha_web_staging
    environment:
      - DATABASE_URL=postgresql://vha_admin:${DB_PASSWORD}@postgres:5432/vha_staging
      - ENVIRONMENT=staging
      - NODE_ENV=production
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /root/.deno:/deno-dir  # Deno module cache
    networks:
      - vha-net

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    container_name: vha_redis_staging
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - vha-net

volumes:
  redis_data:

networks:
  vha-net:
    driver: bridge
```

### Phase 3: Deployment Script

Create `deploy-staging.sh`:

```bash
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
```

### Phase 4: Deployment Automation

**Option A: GitHub Actions (Recommended)**

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          lfs: true

      - name: Deploy to EC2
        env:
          EC2_KEY: ${{ secrets.EC2_STAGING_KEY }}
          EC2_HOST: ${{ secrets.EC2_STAGING_HOST }}
        run: |
          mkdir -p ~/.ssh
          echo "$EC2_KEY" > ~/.ssh/ec2_key.pem
          chmod 600 ~/.ssh/ec2_key.pem
          ssh-keyscan -H $EC2_HOST >> ~/.ssh/known_hosts
          
          scp -i ~/.ssh/ec2_key.pem deploy-staging.sh admin@$EC2_HOST:~
          ssh -i ~/.ssh/ec2_key.pem admin@$EC2_HOST "bash deploy-staging.sh"
```

---

## Alternative Approaches & Comparison

### Option 1: AWS Elastic Container Service (ECS)

**Pros:**
- Managed container orchestration
- Auto-scaling if needed
- Less infrastructure management

**Cons:**
- More complex for small team
- Higher cost for single instance (~$50-100/mo)
- Overkill for staging environment

**When to use:** If you need multi-instance scaling or AWS-native monitoring

---

### Option 2: Deno Deploy

**Pros:**
- Zero infrastructure management
- Built for Deno specifically
- Very fast cold starts

**Cons:**
- **Doesn't support persistent databases** (critical for your case)
- PostgreSQL would run on separate service
- SNOMED data would need to be uploaded somehow
- Wouldn't solve the slow initialization problem

**When to use:** Only for stateless APIs or frontend

---

### Option 3: AWS RDS + EC2

**Pros:**
- Managed PostgreSQL
- Automatic backups
- High availability

**Cons:**
- Higher cost (~$50-150/mo for RDS standalone)
- Overkill for staging
- Still need EC2 for web app

**When to use:** Production environment, not staging

---

### Option 4: Heroku or Render.com

**Pros:**
- Simple git push deploys
- Managed everything
- Good for quick prototypes

**Cons:**
- Cold starts delay deploys
- Would need to handle SNOMED data specially
- Expensive for persistent services
- Less control

**When to use:** Early prototypes, not for iterative staging

---

## Optimization Strategies

### 1. Speed Up SNOMED Data Loading

The first deployment will take longer, but subsequent ones will be fast:

```bash
# First deployment (one-time: ~10-15 min)
- Download SNOMED CT zip (5-10 min)
- Extract and index (5 min)
- Store in EBS volume

# Subsequent deployments (~2 min)
- Docker container restart using existing volume
- Web app redeploy only (~2 min)
```

### 2. Cache Deno Modules

Mount Deno cache in volume:

```yaml
volumes:
  - deno_cache:/root/.deno
```

This avoids re-downloading 1000+ Deno modules.

### 3. Multi-Stage Docker Builds

Your `Dockerfile` already does this—the build stage runs once, layers are cached in Docker.

### 4. Database Indexing

After initial SNOMED load, run:

```bash
docker-compose -f docker-compose.staging.yml exec postgres \
  psql -U vha_admin -d vha_staging -c "CREATE INDEX CONCURRENTLY idx_snomed_relationships ON snomed_relationships(source_id, relationship_type);"
```

---

## Monitoring & Maintenance

### Logs

```bash
# View all logs
docker-compose -f docker-compose.staging.yml logs -f

# View just web app
docker-compose -f docker-compose.staging.yml logs -f web

# View database
docker-compose -f docker-compose.staging.yml logs -f postgres
```

### Disk Usage

```bash
# Check EBS volume usage
df -h /mnt/pgdata

# Check what's taking space
du -sh /mnt/pgdata/*

# Prune old Docker images/volumes
docker system prune -a --volumes
```

### Automated Backups

Add to crontab:

```bash
0 2 * * * /home/admin/virtual-hospitals-africa/scripts/backup-db.sh
```

---

## Cost Estimate

### Monthly Cost (Persistent EC2 Approach)

```
EC2 t3.large (On-demand):        ~$30/month
EBS Volume (100GB GP3):          ~$10/month
Data Transfer (minimal):         ~$2/month
Total:                           ~$42/month
```

### vs. Spinning Up New EC2 Each Deploy

If you deploy 20-30 times per month:

```bash
New EC2 per deploy:   ~$2 per deploy
20 deploys:           ~$40/month

But you lose productivity cost of 15-25 min per deploy
Plus reproducibility issues
```

---

## Security Considerations

1. **Network**: Run EC2 in private subnet, use ALB/NAT for traffic
2. **Credentials**: Use AWS Secrets Manager for DB passwords
3. **Database backups**: Encrypt with KMS
4. **Container security**: Scan images for vulnerabilities
5. **SSH access**: Use AWS Systems Manager Session Manager (no SSH key needed)

---

## Recommended Timeline

**Week 1:**
- [ ] Launch EC2 instance + EBS volumes
- [ ] Install Docker and build infrastructure
- [ ] Initial SNOMED data load (one-time: 10-15 min)

**Week 2:**
- [ ] Set up GitHub Actions workflow
- [ ] Test deployment cycle 5 times
- [ ] Document runbook for team

**Week 3:**
- [ ] Monitor performance for issues
- [ ] Optimize if needed
- [ ] Set up automated backups

---

## Quick Reference: Deployment

```bash
# First time (includes SNOMED load)
ssh admin@<ec2-ip>
bash deploy-staging.sh
# ~15 min

# Subsequent deploys (code changes only)
bash deploy-staging.sh
# ~2-3 min
```

---

## Questions?

Common issues:

- **"SNOMED data didn't download"**: Check disk space with `df -h`
- **"Database won't connect"**: Verify healthcheck with `docker-compose logs postgres`
- **"Container won't start"**: Check logs with `docker logs vha_web_staging` 
- **"Slow deployments"**: Profile startup with `deno task db:migrate latest --verbose`

