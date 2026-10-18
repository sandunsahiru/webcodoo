#!/bin/bash
# Run this from your local machine to deploy backend to VPS
# Usage: bash deploy.sh

VPS_IP="51.79.243.2"
VPS_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/webcodoo-backend"

echo "📦 Deploying Webcodoo backend to VPS..."

# Create remote directory and copy files
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"
scp -r server.js package.json .env.example $VPS_USER@$VPS_IP:$REMOTE_DIR/

# Copy .env if exists locally
if [ -f ".env" ]; then
  scp .env $VPS_USER@$VPS_IP:$REMOTE_DIR/.env
fi

# Install dependencies and restart with PM2
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
  cd /home/ubuntu/webcodoo-backend
  npm install --production
  # Install PM2 if not installed
  which pm2 || npm install -g pm2
  # Stop existing instance if running
  pm2 stop webcodoo-backend 2>/dev/null || true
  pm2 delete webcodoo-backend 2>/dev/null || true
  # Start backend
  pm2 start server.js --name webcodoo-backend
  pm2 save
  echo "✅ Backend deployed and running on port 4000"
ENDSSH
