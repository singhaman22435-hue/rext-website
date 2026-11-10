@echo off
title Push Rext Website to GitHub
echo ====================================================
echo        Pushing Rext Website to GitHub
echo ====================================================
echo.
cd /d "%~dp0"
git branch -M main
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================================
    echo   SUCCESS! Project pushed to GitHub successfully:
    echo   https://github.com/singhaman22435-hue/rext-website
    echo ====================================================
) else (
    echo [NOTE] If you haven't created the repository on GitHub yet:
    echo 1. Open: https://github.com/new
    echo 2. Set Repository name to: rext-website
    echo 3. Click "Create repository"
    echo 4. Then run this script again!
)
pause
