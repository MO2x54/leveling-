@echo off
title VALO.LEVELING - Standalone EXE Builder
cd /d "%~dp0"

echo =====================================================================
echo   VALO.LEVELING - STANDALONE DESKTOP APP BUILDER (MO2A PRIVATE)
echo =====================================================================
echo.

:: 1. Check Python
echo [1/3] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYCMD=python"
    goto :PYTHON_OK
)

py --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYCMD=py"
    goto :PYTHON_OK
)

echo.
echo [ERROR] Python is not installed or not in PATH!
echo -------------------------------------------------------------
echo Please download and install Python from: https://www.python.org/
echo CRITICAL: During installation, CHECK the box: [x] "Add Python to PATH"
echo -------------------------------------------------------------
echo.
pause
exit /b 1

:PYTHON_OK
echo [OK] Python found.

:: 2. Ensure web assets exist
echo.
echo [2/3] Checking pre-compiled web assets...
if not exist "dist\index.html" (
    echo [INFO] dist\index.html not found, unpacking built assets automatically...
    %PYCMD% run_desktop_app.py --extract-only
)

if not exist "dist\index.html" (
    echo [ERROR] Failed to unpack web assets. Please ensure embedded_dist.py exists.
    pause
    exit /b 1
)
echo [OK] Modern web assets verified and ready in 'dist'.

:: 3. Install PyInstaller
echo.
echo [3/3] Preparing PyInstaller engine...
%PYCMD% -m pip install --quiet pyinstaller pillow

:: 4. Build Standalone Executable
echo.
echo =====================================================================
echo Compiling standalone VALO.LEVELING.exe with Valorant Icon...
echo Please wait about 15-30 seconds...
echo =====================================================================

%PYCMD% -m PyInstaller --noconsole --onefile ^
    --name="VALO.LEVELING" ^
    --icon="valorant.ico" ^
    --add-data "dist;dist" ^
    --add-data "valorant.ico;." ^
    run_desktop_app.py

echo.
echo =====================================================================
if exist "dist\VALO.LEVELING.exe" (
    echo [SUCCESS] Standalone EXE created successfully!
    echo Location: dist\VALO.LEVELING.exe
    echo.
    echo Double-click dist\VALO.LEVELING.exe anytime to run the app!
) else (
    echo [NOTE] If PyInstaller had an issue, you can still run the app directly
    echo anytime without building by double-clicking: START_APP.bat
)
echo =====================================================================
echo.
pause
