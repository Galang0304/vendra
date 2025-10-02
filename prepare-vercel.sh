#!/bin/bash

echo "🚀 Preparing Vendra CRM for Vercel Deployment"
echo "============================================"

# Create temporary directory for build
mkdir -p .vercel-build

# Copy essential files only (exclude logs, uploads, etc.)
echo "📦 Copying application files..."

# Copy main application files
cp app.js .vercel-build/
cp package.json .vercel-build/
cp vercel.json .vercel-build/

# Copy source code
cp -r src .vercel-build/
cp -r public .vercel-build/
cp -r setup .vercel-build/

# Copy environment template
cp .env.vercel .vercel-build/.env

# Copy README files
cp README.md .vercel-build/
cp CLIENT_README.md .vercel-build/
cp SETUP_CLIENT.md .vercel-build/

echo "✅ Files copied to .vercel-build/"

echo ""
echo "📋 Next Steps for Vercel Deployment:"
echo "1. cd .vercel-build"
echo "2. vercel --prod"
echo "3. Set environment variables in Vercel dashboard:"
echo "   - DB_HOST=sql12.freesqldatabase.com"
echo "   - DB_USER=sql12800978"
echo "   - DB_PASSWORD=yzJDq4BqVk"
echo "   - DB_NAME=sql12800978"
echo "   - DB_PORT=3306"
echo "   - JWT_SECRET=vendra-crm-vercel-production-key-2024-super-secure"
echo "   - GEMINI_API_KEY=AIzaSyBautBE5Nk49TEsPl69u2QQW3AVpjdAI_0"
echo "   - NODE_ENV=production"
echo "   - VERCEL=1"

echo ""
echo "🎉 Ready for Vercel deployment!"