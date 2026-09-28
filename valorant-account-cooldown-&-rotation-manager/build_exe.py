#!/usr/bin/env python3
"""
Valorant Rotation Tracker - Automated EXE Builder
Owner: Mo2a (Private Edition)
Generates standalone single-file executable: ValorantRotationTracker_Mo2a.exe
"""

import sys
import os
import subprocess
import shutil

def main():
    print("=" * 65)
    print("   VALORANT ROTATION TRACKER - EXE COMPILER (MO2A EDITION)")
    print("=" * 65)

    # 1. Check Python version
    if sys.version_info < (3, 8):
        print("[!] Error: Python 3.8 or higher is required.")
        sys.exit(1)

    print(f"[*] Python version: {sys.version.split()[0]}")

    # 2. Check / install required packages
    required = ["customtkinter", "pyperclip", "pyinstaller"]
    print("[*] Checking dependencies...")
    for pkg in required:
        try:
            __import__(pkg)
            print(f"  [✓] {pkg} is installed.")
        except ImportError:
            print(f"  [i] Installing {pkg}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

    import customtkinter

    # 3. Locate customtkinter assets
    ctk_path = os.path.dirname(customtkinter.__file__)
    print(f"[*] CustomTkinter path: {ctk_path}")

    # Format --add-data separator based on OS (; on Windows, : on POSIX)
    sep = ";" if os.name == "nt" else ":"
    add_data_arg = f"{ctk_path}{sep}customtkinter"

    exe_name = "ValoLeveling"
    main_script = "valorant_cooldown_tracker.py"
    icon_file = "valorant.ico"

    if not os.path.exists(main_script):
        print(f"[!] Error: {main_script} not found in current directory.")
        sys.exit(1)

    # 4. Clean previous builds
    for d in ["build", "dist"]:
        if os.path.exists(d):
            print(f"[*] Cleaning previous '{d}' folder...")
            shutil.rmtree(d, ignore_errors=True)

    # 5. Build PyInstaller command
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onedir" if "--debug" in sys.argv else "--onefile",
        "--windowed",                 # No black terminal window
        "--name", exe_name,
        "--add-data", add_data_arg,
        "--clean",
    ]

    if os.path.exists(icon_file):
        cmd.extend(["--icon", icon_file])
        cmd.extend(["--add-data", f"{icon_file}{sep}."])
        print(f"[*] Attached Valorant app icon: {icon_file}")

    cmd.append(main_script)

    print("[*] Running PyInstaller command:")
    print("    " + " ".join(cmd))
    print("-" * 65)

    try:
        subprocess.check_call(cmd)
        print("-" * 65)
        print("[✓] BUILD COMPLETE!")
        exe_ext = ".exe" if os.name == "nt" else ""
        output_path = os.path.join(os.path.abspath("dist"), f"{exe_name}{exe_ext}")
        
        # Copy portable guide to dist
        guide_src = "README_PORTABLE.txt"
        if os.path.exists(guide_src):
            shutil.copy(guide_src, os.path.join("dist", guide_src))
            print(f"[✓] Copied '{guide_src}' to dist/")

        print(f"[✓] Executable is ready at:")
        print(f"    {output_path}")
        print("=" * 65)
    except subprocess.CalledProcessError as e:
        print(f"[!] PyInstaller build failed with exit code: {e.returncode}")
        sys.exit(e.returncode)

if __name__ == "__main__":
    main()
