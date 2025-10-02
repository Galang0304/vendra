@echo off
echo 🚀 Preparing Vendra CRM for Vercel Deployment
echo ============================================

REM Create temporary directory for build
if not exist ".vercel-build" mkdir .vercel-build

REM Copy essential files only
echo 📦 Copying application files...

REM Copy main application files
copy app.js .vercel-build\
copy package.json .vercel-build\
copy vercel.json .vercel-build\

REM Copy source code
xcopy src .vercel-build\src\ /E /I /Q
xcopy public .vercel-build\public\ /E /I /Q
xcopy setup .vercel-build\setup\ /E /I /Q

REM Copy environment template
copy .env.vercel .vercel-build\.env

REM Copy README files
copy README.md .vercel-build\
copy CLIENT_README.md .vercel-build\
copy SETUP_CLIENT.md .vercel-build\

echo ✅ Files copied to .vercel-build\

echo.
echo 📋 Next Steps for Vercel Deployment:
echo 1. cd .vercel-build
echo 2. vercel --prod
echo 3. Set environment variables in Vercel dashboard:
echo    - DB_HOST=sql12.freesqldatabase.com
echo    - DB_USER=sql12800978
echo    - DB_PASSWORD=yzJDq4BqVk
echo    - DB_NAME=sql12800978
echo    - DB_PORT=3306
echo    - JWT_SECRET=vendra-crm-vercel-production-key-2024-super-secure
echo    - GEMINI_API_KEY=AIzaSyBautBE5Nk49TEsPl69u2QQW3AVpjdAI_0
echo    - NODE_ENV=production
echo    - VERCEL=1

echo.
echo 🎉 Ready for Vercel deployment!
pause