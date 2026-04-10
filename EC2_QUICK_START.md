# 🚀 VHA Staging Deployment - Quick Start Checklist

## Pre-Launch Checklist

- [ ] AWS account access with permissions to create EC2, EBS, S3, IAM
- [ ] EC2 Key Pair created (download `.pem` file and save securely)
- [ ] VPC ID noted
- [ ] Subnet ID noted (in desired region)
- [ ] Strong PostgreSQL password ready (12+ chars, mixed case, numbers, symbols)
  - Example: `V#Pg2026!Staging$Pass`

## Option A: CloudFormation Stack Launch (Recommended)

**Time: ~5 minutes to create infrastructure**

### Step 1: Prepare Stack Parameters

```bash
# From your local machine, collect:
KEY_PAIR_NAME="your-ec2-key-pair"
DB_PASSWORD="V#Pg2026!Staging$Pass"
VPC_ID="vpc-xxxxxxxxxx"
SUBNET_ID="subnet-yyyyyyyyyy"
```

### Step 2: Launch Stack

```bash
aws cloudformation create-stack \
  --stack-name vha-staging \
  --template-body file://scripts/vha-staging-cloudformation.yaml \
  --region us-east-1 \
  --parameters \
    ParameterKey=KeyName,ParameterValue=$KEY_PAIR_NAME \
    ParameterKey=DBPassword,ParameterValue="$DB_PASSWORD" \
    ParameterKey=VPC,ParameterValue=$VPC_ID \
    ParameterKey=Subnet,ParameterValue=$SUBNET_ID \
  --capabilities CAPABILITY_NAMED_IAM
```

### Step 3: Wait for Completion

```bash
# Monitor (usually ~5-7 minutes)
watch -n 10 "aws cloudformation describe-stacks \
  --stack-name vha-staging \
  --query 'Stacks[0].StackStatus' --output text"

# Should show: CREATE_COMPLETE
```

### Step 4: Collect Outputs

```bash
aws cloudformation describe-stacks \
  --stack-name vha-staging \
  --query 'Stacks[0].Outputs' --output table

# Save the InstancePublicIP and BackupBucketName outputs
```

**→ Jump to Step 5 below**

---

## Option B: Manual EC2 Launch

**Time: ~10 minutes to configure**

### Step 1: Launch EC2 Instance

**Via AWS Console:**
1. EC2 Dashboard > Instances > Launch Instance
2. AMI: Debian 12 (or Ubuntu 24.04)
3. Instance Type: `t3.large`
4. Storage:
   - Root: 50GB `gp3` (default)
   - Add Volume: 100GB `gp3` `/dev/sdf`
5. Security Group: New group
   - SSH (22): Anywhere
   - HTTP (80): Anywhere
   - HTTPS (443): Anywhere
   - App (8000): Anywhere
6. Key Pair: Select your key
7. Launch

**Via AWS CLI:**
```bash
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0a8e758f5e873d1c1 \
  --instance-type t3.large \
  --key-name $KEY_PAIR_NAME \
  --query 'Instances[0].InstanceId' --output text)

echo "Instance ID: $INSTANCE_ID"
```

### Step 2: Wait for Instance to Start

```bash
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Public IP: $PUBLIC_IP"
```

### Step 3: SSH and Run Setup

```bash
# SSH into instance (wait ~30 seconds for boot)
ssh -i path/to/key-pair.pem admin@$PUBLIC_IP

# If admin user doesn't exist, use 'ubuntu' or 'admin@' and:
sudo useradd -m -s /bin/bash admin

# Download and run setup
cd /tmp
wget https://raw.githubusercontent.com/Virtual-Hospitals-Africa/virtual-hospitals-africa/main/scripts/ec2-setup.sh
bash ec2-setup.sh "$DB_PASSWORD"

# Setup runs automatically; takes ~3 minutes
```

---

## Step 5: Configure GitHub Secrets

**On main machine (not EC2):**

### In GitHub Repository Settings:

1. Settings > Secrets and Variables > Actions
2. Create new secrets:

```
Name: EC2_STAGING_KEY
Value: [Contents of your .pem private key]

Name: EC2_STAGING_HOST  
Value: [The public IP from above - e.g., 54.123.456.789]

Name: DB_PASSWORD
Value: [Same password as above - e.g., V#Pg2026!Staging$Pass]
```

---

## Step 6: Deploy to Staging

### Manual Deploy (from EC2)

```bash
# SSH back into EC2
ssh -i path/to/key-pair.pem admin@$PUBLIC_IP

# Edit environment file
nano /home/admin/virtual-hospitals-africa/.env.staging

# Run deployment (first time: ~15 min, subsequent: ~2-3 min)
vha-deploy

# Watch logs
vha-logs web
```

Visit: `http://$PUBLIC_IP:8000`

### Automated Deploy (via GitHub)

```bash
# From your local machine
git push origin main

# GitHub Actions runs automatically
# Check: GitHub > Actions > Deploy to Staging
```

---

## Step 7: Verify Deployment

```bash
# From local machine or EC2
ssh -i path/to/key-pair.pem admin@$PUBLIC_IP

# Check status
vha-status
# Should show:
# - Docker containers running
# - PostgreSQL healthy
# - Disk space available
# - SNOMED data cached

# View logs
vha-logs
# Should show no errors

# Test web server
curl http://localhost:8000
# Should return HTML or JSON response
```

---

## 📋 Deployment Workflow

### First Time Setup (Developers)
1. ✅ Check EC2 is running and accessible
2. ✅ Configure `.env.staging`
3. ✅ Run `vha-deploy` manually (watch SNOMED load)
4. ✅ Verify at `http://<IP>:8000`

### Subsequent Changes
```bash
# Make code changes locally
git commit -am "feature/my-feature"
git push origin main

# GitHub Actions automatically deploys
# Check progress: GitHub.com > Actions tab
```

### Manual Deploy During Development
```bash
# SSH to EC2
ssh -i key.pem admin@<IP>

# Quick re-deploy (keeps data)
vha-deploy
```

---

## 🔧 Useful Commands

**On EC2 instance:**
```bash
vha-deploy              # Run deployment
vha-logs [service]      # View logs (web/postgres/redis)
vha-status              # System status
```

**From local machine:**
```bash
# SSH to EC2
ssh -i key.pem admin@<IP>

# View logs
ssh -i key.pem admin@<IP> "vha-logs web | tail -50"

# Restart containers
ssh -i key.pem admin@<IP> "docker-compose -f docker-compose.staging.yml restart web"

# Stop instance (save money when not in use)
aws ec2 stop-instances --instance-ids <INSTANCE_ID>
```

---

## 💰 Cost Tracking

```bash
# AWS Cost Explorer or:
aws ce get-cost-and-usage \
  --time-period Start=2026-04-01,End=2026-04-30 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't SSH | Security group allows port 22? Wait 30s after launch |
| SNOMED download stalled | Check disk space: `df -h /mnt/pgdata` |
| Web server won't start | Check logs: `vha-logs web` |
| Database won't connect | Restart postgres: `vha-logs postgres` |
| Out of disk | Clean backups: `rm /mnt/pgdata/backups/old-*.sql.gz` |

See **EC2_SETUP_GUIDE.md** for detailed troubleshooting.

---

## 📚 Documentation

- **Full Guide**: [EC2_SETUP_GUIDE.md](EC2_SETUP_GUIDE.md)
- **Staging Config**: [docker-compose.staging.yml](docker-compose.staging.yml)
- **Deploy Script**: [scripts/deploy-staging.sh](scripts/deploy-staging.sh)
- **Main Guide** (referenced): [STAGING_DEPLOYMENT_GUIDE.md](STAGING_DEPLOYMENT_GUIDE.md)

---

## ✅ Success Indicators

After successful setup, you should see:

```
✅ EC2 t3.large instance running (public IP assigned)
✅ Secondary EBS volume mounted at /mnt/pgdata
✅ Docker containers running (web, postgres, redis)
✅ SNOMED data cached (~2GB in /mnt/pgdata)
✅ Web app accessible at http://<IP>:8000
✅ GitHub Actions workflow in .github/workflows/deploy-staging.yml
✅ Deployments triggered by `git push origin main`
```

---

**Expected Total Time: 30-45 minutes from "now" to fully operational staging environment**

Ready? Start with **Option A** (CloudFormation) or **Option B** (Manual). Let us know if you hit any issues!
