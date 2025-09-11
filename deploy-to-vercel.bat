@echo off
echo ================================================
echo   Scoop Unit - Vercel Deployment Script
echo ================================================
echo.

echo Installing Vercel CLI...
npm install -g vercel

echo.
echo Logging into Vercel...
echo (This will open your browser to log in)
vercel login

echo.
echo Deploying to production...
vercel --prod

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
echo Your Apple-inspired website should now be live!
echo Visit: https://scoopunit.com
echo.
pause