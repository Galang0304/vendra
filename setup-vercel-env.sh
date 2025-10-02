#!/bin/bash
# Setup Environment Variables untuk Vercel Production

echo "🔧 Setting up Vercel Environment Variables..."

# Database Configuration
vercel env add DB_HOST production
echo "sql12.freesqldatabase.com"

vercel env add DB_USER production
echo "sql12800978"

vercel env add DB_PASSWORD production
echo "yzJDq4BqVk"

vercel env add DB_NAME production
echo "sql12800978"

vercel env add DB_PORT production
echo "3306"

# JWT Secret
vercel env add JWT_SECRET production
echo "vendra-crm-vercel-production-key-2024-super-secure"

# Node Environment
vercel env add NODE_ENV production
echo "production"

# Vercel Flag
vercel env add VERCEL production
echo "1"

# Gemini API (optional - sesuaikan dengan key Anda)
vercel env add GEMINI_API_KEY production
echo "YOUR_GEMINI_API_KEY_HERE"

echo "✅ Environment variables setup completed!"
echo "🚀 Redeploy your application with: vercel --prod"