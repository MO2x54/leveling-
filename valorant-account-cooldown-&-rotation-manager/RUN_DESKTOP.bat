@echo off
setlocal enabledelayedexpansion
title Launching VALO.LEVELING...
cd /d "%~dp0"

set PYCMD=
where python >nul 2>&1
if !errorlevel! equ 0 (
    set PYCMD=python
) else (
    where py >nul 2>&1
    if !errorlevel! equ 0 (
        set PYCMD=py
    )
)

if "!PYCMD!"=="" (
    echo [ERROR] Python not found.
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

:: Run silently via pythonw if available, else python
start "" "!PYCMD!w" run_desktop_app.py 2>nul || start "" "!PYCMD!" run_desktop_app.py
exit
