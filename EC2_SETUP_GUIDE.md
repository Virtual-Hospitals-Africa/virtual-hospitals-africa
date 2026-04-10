# VHA Staging EC2 Setup Guide

## Overview

This guide walks through launching and configuring a persistent EC2 instance for VHA staging deployments. The setup minimizes deployment time by caching SNOMED data and dependencies on persistent EBS volumes.

**Expected Timeline:**

- Initial EC2 setup: ~10 minutes
- First deployment (with SNOMED load): ~15 minutes
- Subsequent deployments: ~2-3 minutes

## Option 1: AWS CloudFormation (Recommended - Fastest)

### Step 1: Prepare

1. Create/have an AWS EC2 Key Pair ready
2. Know your VPC ID and desired Subnet ID
3. Decide on a strong PostgreSQL password (12+ characters)

### Step 2: Launch Stack

```bash
# Download the template
cd vha-workspace
cat scripts/vha-staging-cloudformation.yaml

# Launch via AWS CLI
aws cloudformation create-stack \
  --stack-name vha-staging \
  --template-body file://scripts/vha-staging-cloudformation.yaml \
  --parameters \
    ParameterKey=KeyName,ParameterValue=your-key-pair-name \
    ParameterKey=DBPassword,ParameterValue='YourStrongPassword123!' \
    ParameterKey=VPC,ParameterValue=vpc-xxxxxxxx \
    ParameterKey=Subnet,ParameterValue=subnet-xxxxxxxx \
  --capabilities CAPABILITY_NAMED_IAM
```

Or via AWS Console:

- Go to CloudFormation > Create Stack
- Upload template: `scripts/vha-staging-cloudformation.yaml`
- Fill in parameters and create

### Step 3: Wait for Stack Creation (~5 minutes)

```bash
# Monitor stack creation
aws cloudformation describe-stacks --stack-name vha-staging --query 'Stacks[0].StackStatus'

# Should show: CREATE_COMPLETE
```

### Step 4: Get Instance Details

```bash
# Get the public IP
aws cloudformation describe-stacks \
  --stack-name vha-staging \
  --query 'Stacks[0].Outputs[?OutputKey==`InstancePublicIP`].OutputValue' \
  --output text
```

---

## Option 2: Manual EC2 Setup (More Control)

### Step 1: Launch EC2 Instance

**AWS Console:**

1. Go to EC2 > Instances > Launch Instance
2. **AMI**: Debian 12 or Ubuntu 24.04 LTS
3. **Instance Type**: t3.large (2 vCPU, 8GB RAM)
4. **Storage**:
   - Root volume: 50GB gp3
   - Add EBS volume: 100GB gp3
5. **Security Group**: Allow SSH (22), HTTP (80), HTTPS (443), App port (8000)
6. **Key Pair**: Select or create
7. Click Launch

**Or via AWS CLI:**

```bash
aws ec2 run-instances \
  --image-id ami-0a8e758f5e873d1c1 \  # Debian 12 AMI (check region)
  --instance-type t3.large \
  --key-name your-key-pair \
  --security-groups vha-staging \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=vha-staging}]'
```

### Step 2: Attach Secondary Volume

```bash
# Note the instance ID from launch output
INSTANCE_ID="i-xxxxxxxxx"
VOLUME_ID="vol-xxxxxxxxx"  # Create or use existing 100GB gp3 volume

aws ec2 attach-volume \
  --volume-id $VOLUME_ID \
  --instance-id $INSTANCE_ID \
  --device /dev/sdf
```

### Step 3: Connect & Run Setup

```bash
# SSH into instance
ssh -i your-key-pair.pem admin@<public-ip>

# If 'admin' user doesn't exist, use 'ec2-user' or 'ubuntu' first, then:
sudo useradd -m -s /bin/bash admin

# Download and run setup script
cd /tmp
wget https://raw.githubusercontent.com/Virtual-Hospitals-Africa/virtual-hospitals-africa/main/scripts/ec2-setup.sh
bash ec2-setup.sh YourStrongPassword123!

# The script will:
# - Install Docker & Docker Compose
# - Format and mount secondary EBS volume
# - Clone the repository
# - Create helper commands
```

---

## Step 5: Configure Environment & Deploy

### Verify Setup

```bash
# SSH into instance
ssh -i your-key.pem admin@<public-ip>

# Check status
vha-status
# Output should show:
# - Docker containers running
# - Secondary volume mounted at /mnt/pgdata
# - Free disk space
```

### Configure .env.staging

```bash
cd /home/admin/virtual-hospitals-africa

# Copy and edit template
cp .env.staging.example .env.staging
nano .env.staging

# Make sure DB_PASSWORD matches what you set during setup
```

### First Deployment (with SNOMED)

```bash
cd /home/admin/virtual-hospitals-africa

# Run initial deployment (~15 minutes)
# This will:
# - Create database
# - Run migrations
# - Download and index SNOMED data (~5-10 min)
# - Start web server
bash scripts/deploy-staging.sh
```

Monitor progress:

```bash
# In another terminal
vha-logs web     # Application logs
vha-logs postgres # Database init logs
```

Once complete, verify it's running:

```bash
curl http://localhost:8000
```

---

## Subsequent Deployments

### Manual Deploy (from EC2)

```bash
vha-deploy
# ~2-3 minutes (SNOMED already cached)
```

### Automated Deploy (via GitHub Actions)

1. Add GitHub Secrets to your repository:
   - `EC2_STAGING_KEY`: Contents of your EC2 SSH private key
   - `EC2_STAGING_HOST`: The public IP of your EC2 instance
   - `DB_PASSWORD`: The PostgreSQL password

2. Push to main branch:

```bash
git push origin main
# GitHub Actions will automatically run deploy-staging.yml
```

Check deployment status in GitHub > Actions

---

## Helper Commands

Available on the EC2 instance after setup:

```bash
# Run deployment
vha-deploy

# View logs (all containers, or specific)
vha-logs              # All logs
vha-logs web          # App logs only
vha-logs postgres     # Database logs only

# Check system status
vha-status
# Shows:
# - Running containers
# - Disk usage
# - Volume details

# Manual commands
docker-compose -f docker-compose.staging.yml restart web
docker-compose -f docker-compose.staging.yml exec web deno task db:migrate latest
```

---

## Database Backups

Backups are created automatically before each deployment. They're stored at:

```
/mnt/pgdata/backups/vha_staging_YYYYMMDD_HHMMSS.sql.gz
```

### Manual Backup

```bash
cd /home/admin/virtual-hospitals-africa
docker-compose -f docker-compose.staging.yml exec postgres \
  pg_dump -U vha_admin vha_staging | gzip > /mnt/pgdata/backups/manual_backup_$(date +%s).sql.gz
```

### Restore from Backup

```bash
# List available backups
ls -lh /mnt/pgdata/backups/

# Restore (example)
gunzip < /mnt/pgdata/backups/vha_staging_20260410_080000.sql.gz | \
  docker-compose -f docker-compose.staging.yml exec -T postgres \
  psql -U vha_admin vha_staging
```

---

## Cost Optimization

### Current Setup Cost (~$40-50/month)

```
EC2 t3.large (on-demand):     ~$30
EBS storage (100GB gp3):      ~$10
Data transfer (minimal):      ~$2
Total:                        ~$42/month
```

### Cost Reduction Options

**Reserved Instances** (if you'll keep it running):

```
EC2 t3.large (1-year reserved): ~$12/month
EBS (reserved):               ~$6/month
Total:                        ~$18/month (save 50%)
```

**Stop instance when not in use:**

```bash
# From your local machine
aws ec2 stop-instances --instance-ids i-xxxxxxxx

# Restart when needed
aws ec2 start-instances --instance-ids i-xxxxxxxx
```

---

## Troubleshooting

### "Connection refused" on port 8000

```bash
# Check if web container is running
docker-compose -f docker-compose.staging.yml ps

# Check logs
vha-logs web

# Restart container
docker-compose -f docker-compose.staging.yml restart web
```

### "SNOMED data didn't download"

```bash
# Check disk space
vha-status

# Check postgres logs
vha-logs postgres

# Manually trigger SNOMED load
docker-compose -f docker-compose.staging.yml exec web \
  deno task db:seed load 02_snomed_base
```

### "Database connection failed"

```bash
# Check if postgres is healthy
docker-compose -f docker-compose.staging.yml ps postgres

# Check postgres logs
vha-logs postgres

# Try restarting
docker-compose -f docker-compose.staging.yml restart postgres
```

### "Out of disk space"

```bash
# Check usage
df -h /mnt/pgdata

# Clean up old backups (keep last 5)
ls -t /mnt/pgdata/backups/ | tail -n +6 | xargs rm

# Prune Docker data
docker system prune -a --volumes
```

---

## Security Notes

### For Production/Public Staging

1. **Restrict SSH access**:

```bash
# Edit security group to allow SSH only from your IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp --port 22 \
  --cidr YOUR_IP/32
```

2. **Use AWS Systems Session Manager** (no SSH key needed):

```bash
aws ssm start-session --target i-xxxxxxxx
```

3. **Enable database password authentication**:
   - Don't use empty passwords
   - Rotate passwords regularly
   - Use AWS Secrets Manager to store passwords

4. **Enable CloudWatch monitoring**:

```bash
# The CloudFormation template includes CloudWatch agent
# Check CloudWatch dashboard for metrics
```

---

## Monitoring

### View Metrics

```bash
# CPU & Memory usage
docker stats

# Disk I/O
iostat -x 1

# Network traffic
iftop
```

### Set Up Alerts

```bash
# CloudWatch alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name vha-staging-high-cpu \
  --alarm-description "Alert if CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

---

## Next Steps

1. ✅ Launch EC2 instance
2. ✅ Copy SSH key to a safe location
3. ✅ Get the public IP address
4. ✅ Add GitHub Secrets for automated deployments
5. Push to main and watch GitHub Actions deploy!

Need help? Check logs or reach out to the team.
