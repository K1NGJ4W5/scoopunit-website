@echo off
title Vercel Project Cleanup
echo ================================================
echo   VERCEL PROJECT CLEANUP SCRIPT
echo ================================================
echo.
echo This script will help you remove unused Vercel projects
echo and keep only the working scoopunit-website project.
echo.
echo Current projects found:
echo.

echo Listing all your Vercel projects...
vercel projects ls

echo.
echo ================================================
echo   PROJECTS TO DELETE (unused/duplicate)
echo ================================================
echo.
echo Based on the project list above, these appear to be duplicates:
echo - scoopunit-website-pnf7 (duplicate)
echo - scoopunit-website-xctk (duplicate) 
echo - scoopunit (empty project)
echo.
echo KEEP THIS PROJECT:
echo - scoopunit-website (has www.scoopunit.com domain)
echo.
echo ================================================
echo   CLEANUP COMMANDS
echo ================================================
echo.
echo Run these commands to delete unused projects:
echo.

echo Deleting duplicate project: scoopunit-website-pnf7
vercel projects rm scoopunit-website-pnf7 --yes
if errorlevel 1 (
    echo Note: scoopunit-website-pnf7 may not exist or already deleted
)

echo.
echo Deleting duplicate project: scoopunit-website-xctk  
vercel projects rm scoopunit-website-xctk --yes
if errorlevel 1 (
    echo Note: scoopunit-website-xctk may not exist or already deleted
)

echo.
echo Deleting empty project: scoopunit
vercel projects rm scoopunit --yes
if errorlevel 1 (
    echo Note: scoopunit may not exist or already deleted
)

echo.
echo ================================================
echo   CLEANUP COMPLETE!
echo ================================================
echo.
echo Remaining projects:
vercel projects ls

echo.
echo Your main project "scoopunit-website" should remain
echo with https://www.scoopunit.com as the production URL
echo.
pause