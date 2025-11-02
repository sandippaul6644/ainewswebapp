#!/bin/bash

# AWS Deployment Script
echo "🚀 Starting AWS deployment..."

# Upload project to EC2 (run this from your local machine)
# scp -i your-key.pem -r . ubuntu@YOUR_EC2_IP:~/ainewswebapp/

# On EC2 server, run these commands:
cd ~/ainewswebapp

# Install dependencies
npm install

# Build the project
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment completed!"
echo "🌐 Access your app at: http://YOUR_EC2_IP:3001"