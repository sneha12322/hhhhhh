#!/bin/bash
# Cloudflare Pages Deployment Setup

# This script sets up your project for Cloudflare Pages
# The frontend builds to frontend/dist
# The backend runs as Cloudflare Workers

npm install

# Install Wrangler (Cloudflare Workers CLI)
npm install --save-dev @cloudflare/wrangler

# Build frontend
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Cloudflare Pages project: https://dash.cloudflare.com/?to=/:account/pages"
echo "2. Connect your GitHub repo (2608mray-boop/live-fyi)"
echo "3. Set build settings:"
echo "   - Framework: None"
echo "   - Build command: npm run build"
echo "   - Build output directory: frontend/dist"
echo ""
echo "4. Deploy!"
