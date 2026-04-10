#!/bin/bash
set -e

# VHA Staging EC2 Setup Script
# Run this on a fresh Debian 12 or Ubuntu 24.04 EC2 instance
# Usage: bash ec2-setup.sh

echo "╔════════════════════════════════════════════════════════╗"
echo "║   VHA Staging Environment - EC2 Setup                  ║"
echo "╚════════════════════════════════════════════════════════╝"

# Variables
DB_PASSWORD="${1:-changeme}"  # Pass as first arg or set in production to a strong password
REPO_URL="https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa.git"
REPO_DIR="/home/admin/virtual-hospitals-africa"

echo "👤 Setting up system user..."
if ! id admin &>/dev/null; then
  sudo useradd -m -s /bin/bash admin
  sudo usermod -aG docker admin
fi

echo "🔧 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
  curl \
  git \
  git-lfs \
  wget \
  htop \
  build-essential

echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  rm get-docker.sh
  sudo usermod -aG docker admin
fi

echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
  sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

echo "💾 Configuring secondary EBS volume..."
# Find the secondary volume (usually /dev/nvme1n1 on t3 instances)
SECONDARY_VOLUME=$(lsblk | grep -v "sda\|nvme0" | grep nvme | head -1 | awk '{print "/dev/"$1}' || echo "")

if [ -z "$SECONDARY_VOLUME" ]; then
  echo "⚠️  No secondary volume detected. Skipping format step."
  echo "   Manually attach a secondary EBS volume and run:"
  echo "   sudo mkfs.ext4 /dev/nvme1n1"
  echo "   sudo mkdir -p /mnt/pgdata"
  echo "   sudo mount /dev/nvme1n1 /mnt/pgdata"
else
  echo "   Found secondary volume: $SECONDARY_VOLUME"
  if ! sudo blkid $SECONDARY_VOLUME 2>/dev/null | grep -q ext4; then
    echo "   Formatting $SECONDARY_VOLUME as ext4..."
    sudo mkfs.ext4 "$SECONDARY_VOLUME"
  fi
  
  echo "   Creating mount point..."
  sudo mkdir -p /mnt/pgdata
  
  if ! grep -q "/mnt/pgdata" /etc/fstab; then
    echo "   Adding to /etc/fstab for persistent mount..."
    # Get UUID
    VOLUME_UUID=$(sudo blkid -s UUID -o value "$SECONDARY_VOLUME")
    echo "UUID=$VOLUME_UUID /mnt/pgdata ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab > /dev/null
  fi
  
  echo "   Mounting volume..."
  sudo mount /mnt/pgdata 2>/dev/null || true
fi

echo "📁 Setting up directory permissions..."
sudo chown admin:admin /mnt/pgdata
sudo chmod 755 /mnt/pgdata
mkdir -p /mnt/pgdata/backups

echo "📦 Cloning repository..."
if [ ! -d "$REPO_DIR" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
  git lfs pull
else
  echo "   Repository already exists at $REPO_DIR"
fi

echo "🔐 Setting up environment file..."
if [ ! -f "$REPO_DIR/.env.staging" ]; then
  cat > "$REPO_DIR/.env.staging" << EOF
# Staging Environment Configuration
DB_PASSWORD=$DB_PASSWORD
ENVIRONMENT=staging
NODE_ENV=production
EOF
  echo "   Created .env.staging (edit with your actual values)"
fi

echo "📝 Creating startup convenience scripts..."
sudo tee /usr/local/bin/vha-deploy > /dev/null << 'SCRIPT'
#!/bin/bash
cd /home/admin/virtual-hospitals-africa
bash scripts/deploy-staging.sh "$@"
SCRIPT
sudo chmod +x /usr/local/bin/vha-deploy

sudo tee /usr/local/bin/vha-logs > /dev/null << 'SCRIPT'
#!/bin/bash
cd /home/admin/virtual-hospitals-africa
docker-compose -f docker-compose.staging.yml logs -f "$@"
SCRIPT
sudo chmod +x /usr/local/bin/vha-logs

sudo tee /usr/local/bin/vha-status > /dev/null << 'SCRIPT'
#!/bin/bash
echo "=== Docker Status ==="
docker ps
echo ""
echo "=== Disk Usage ==="
df -h /mnt/pgdata
echo ""
echo "=== Volume Details ==="
du -sh /mnt/pgdata/*
SCRIPT
sudo chmod +x /usr/local/bin/vha-status

echo "✅ Installing Deno runtime..."
if ! command -v deno &> /dev/null; then
  curl -fsSL https://deno.land/install.sh | sh
  export DENO_INSTALL="/home/admin/.deno"
  export PATH="$DENO_INSTALL/bin:$PATH"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ EC2 Setup Complete!                               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo "   1. Review/edit: $REPO_DIR/.env.staging"
echo "   2. Run initial deployment:"
echo "      sudo su - admin"
echo "      cd $REPO_DIR"
echo "      bash scripts/deploy-staging.sh"
echo ""
echo "🛠️  Helper commands:"
echo "   vha-deploy          Run deployment"
echo "   vha-logs [service]  View logs (e.g., 'vha-logs web')"
echo "   vha-status          Check system status"
echo ""
echo "📊 Volume details:"
df -h /mnt/pgdata
