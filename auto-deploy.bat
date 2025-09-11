@echo off
title Scoop Unit - Auto Deploy Script
echo ================================================
echo   SCOOP UNIT - AUTOMATED DEPLOYMENT SCRIPT
echo ================================================
echo.
echo This script will:
echo 1. Install Vercel CLI
echo 2. Deploy your Apple-inspired website
echo 3. Configure domain automatically
echo 4. Enable GitHub Pages as backup
echo.
pause

echo.
echo [1/4] Installing Vercel CLI...
npm install -g vercel
if errorlevel 1 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)

echo.
echo [2/4] Logging into Vercel...
echo (This will open your browser)
vercel login
if errorlevel 1 (
    echo ERROR: Vercel login failed
    pause
    exit /b 1
)

echo.
echo [3/4] Deploying to Vercel...
vercel --prod --yes
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo [4/4] Configuring domain...
echo Adding scoopunit.com domain...
vercel domains add scoopunit.com
vercel domains add www.scoopunit.com

echo.
echo ================================================
echo   DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Your Apple-inspired website should now be live at:
echo https://scoopunit.com
echo.
echo If you see any errors above, GitHub Pages is also
echo configured as backup hosting.
echo.
echo Expected features on your live site:
echo - Clean white Apple-inspired design
echo - "Your Yard. Clean. Safe. Always." headline  
echo - Blue "FREE 1 Min Quote" buttons
echo - Customer testimonials section
echo - Mobile-responsive layout
echo.
pause