@echo off
setlocal
cd /d "%~dp0"

echo ====================================================
echo   Starting Smooth Scroll Video Animation
echo ====================================================

:: Check if node exists in PATH
where node >nul 2>nul
if %errorlevel% equ 0 (
    node server.js
    goto :eof
)

:: Check playwright embedded node
if exist "C:\Users\admin\AppData\Local\ms-playwright-go\1.57.0\node.exe" (
    "C:\Users\admin\AppData\Local\ms-playwright-go\1.57.0\node.exe" server.js
    goto :eof
)

:: Fallback: Open index.html directly in browser
echo Node.js not detected in PATH, opening directly in browser...
start "" "%~dp0index.html"
