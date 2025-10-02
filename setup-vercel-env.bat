@echo off
REM Setup Environment Variables untuk Vercel Production

echo 🔧 Setting up Vercel Environment Variables...

REM Database Configuration
echo Setting DB_HOST...
echo sql12.freesqldatabase.com | vercel env add DB_HOST production

echo Setting DB_USER...
echo sql12800978 | vercel env add DB_USER production

echo Setting DB_PASSWORD...
echo yzJDq4BqVk | vercel env add DB_PASSWORD production

echo Setting DB_NAME...
echo sql12800978 | vercel env add DB_NAME production

echo Setting DB_PORT...
echo 3306 | vercel env add DB_PORT production

REM JWT Secret
echo Setting JWT_SECRET...
echo vendra-crm-vercel-production-key-2024-super-secure | vercel env add JWT_SECRET production

REM Node Environment
echo Setting NODE_ENV...
echo production | vercel env add NODE_ENV production

REM Vercel Flag
echo Setting VERCEL...
echo 1 | vercel env add VERCEL production

echo ✅ Environment variables setup completed!
echo 🚀 Redeploy your application with: vercel --prod
pause