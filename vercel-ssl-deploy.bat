@echo off
echo ================================================
echo   VERCEL DEPLOYMENT WITH AUTOMATIC SSL
echo ================================================
echo.
echo This will deploy to Vercel with proper SSL certificate
echo for scoopunit.com (no certificate warnings)
echo.
pause

echo Installing Vercel CLI...
npm install -g vercel

echo.
echo Logging into Vercel...
vercel login

echo.
echo Deploying with production settings...
vercel --prod

echo.
echo Adding custom domain with automatic SSL...
vercel domains add scoopunit.com
vercel domains add www.scoopunit.com

echo.
echo ================================================
echo   DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Vercel will automatically:
echo - Provision SSL certificate for scoopunit.com
echo - Handle HTTPS redirect
echo - Show green lock in browser
echo.
echo Your Apple-inspired website will be live with
echo proper SSL at: https://scoopunit.com
echo.
pause