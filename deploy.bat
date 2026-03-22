@echo off
:: ═══════════════════════════════════════════════════════
::  DerivX — GitHub Deploy Script (Windows)
::  Run this from inside your derivx-next/ folder
::  Double-click or run: deploy.bat
:: ═══════════════════════════════════════════════════════

echo.
echo ╔══════════════════════════════════════╗
echo ║   DerivX - GitHub Deploy (Windows)   ║
echo ╚══════════════════════════════════════╝
echo.

:: Check git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found!
    echo    Download from: https://git-scm.com/download/win
    echo    Install it, then re-run this script
    pause
    exit /b 1
)
echo ✅ Git found

:: Get user inputs
echo.
set /p GH_USER=👤 Enter your GitHub username: 
set /p REPO_NAME=📦 Enter repo name (e.g. derivx): 
set /p GIT_EMAIL=📧 Enter your email: 

echo.
echo 📋 Summary:
echo    GitHub User : %GH_USER%
echo    Repo Name   : %REPO_NAME%
echo    Email       : %GIT_EMAIL%
echo.
pause

:: Configure git
git config --global user.name "%GH_USER%"
git config --global user.email "%GIT_EMAIL%"
echo ✅ Git identity configured

:: Init repo
if not exist ".git" (
    git init
    echo ✅ Git repo initialized
) else (
    echo ℹ Git repo already exists
)

:: Create .gitignore
if not exist ".gitignore" (
    echo node_modules/ > .gitignore
    echo .next/ >> .gitignore
    echo .env >> .gitignore
    echo .DS_Store >> .gitignore
    echo ✅ .gitignore created
)

:: Stage and commit
git add .
git commit -m "Initial DerivX commit"
git branch -M main
echo ✅ Initial commit done

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📌 Now create the GitHub repo:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   1. Go to: https://github.com/new
echo   2. Name: %REPO_NAME%  ^|  Set: Public  ^|  NO README
echo   3. Click "Create repository"
echo   4. Come back here and press any key
echo.
pause

:: Add remote and push
git remote add origin https://github.com/%GH_USER%/%REPO_NAME%.git
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ Pushed to: https://github.com/%GH_USER%/%REPO_NAME%
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 🌐 Deploy to Netlify:
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo   1. Go to https://app.netlify.com
    echo   2. Add new site - Import from Git
    echo   3. Select your repo: %REPO_NAME%
    echo   4. Build command:  npm run build
    echo   5. Publish dir:    .next
    echo   6. Deploy!
    echo.
    echo 🎉 All done!
) else (
    echo.
    echo ❌ Push failed - check your GitHub token
    echo    See: https://docs.github.com/en/authentication
)

pause
