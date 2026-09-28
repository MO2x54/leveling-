@echo off
title Launching VALO.LEVELING...
cd /d "%~dp0"

echo Starting VALO.LEVELING (Identical to Web Preview)...

python --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYCMD=python"
    goto :RUN
)

py --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYCMD=py"
    goto :RUN
)

echo.
echo [ERROR] Python is not installed or not in PATH!
echo Please install Python (with "Add Python to PATH" checked) from https://www.python.org/
echo.
pause
exit /b 1

:RUN
%PYCMD% run_desktop_app.py
if %errorlevel% neq 0 (
    echo.
    echo [NOTE] Application exited.
    pause
)
