#!/usr/bin/env python3
"""
VALO.LEVELING - Native Desktop App Launcher
--------------------------------------------
Runs the modern, GPU-accelerated Valorant Leveling & 19H Cooldown Manager
in a standalone native desktop window (identical to the web preview 100%)
with the official Valorant taskbar icon and zero latency.
"""

import sys
import os
import time
import socket
import threading
import subprocess
import tempfile
import io
import tarfile
import base64
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# Windows Taskbar AppUserModelID fix (Forces Windows to show the Valorant taskbar icon)
if sys.platform == "win32":
    try:
        import ctypes
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("VALO.LEVELING.MO2A.DESKTOP.1.0")
    except Exception:
        pass

server_running = True
last_heartbeat = time.time()

def get_base_dir() -> str:
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

def ensure_dist_exists() -> str:
    """If dist/index.html is missing on disk, automatically unpack from embedded_dist."""
    base = get_base_dir()
    dist_dir = os.path.join(base, 'dist')
    index_file = os.path.join(dist_dir, 'index.html')
    if os.path.isfile(index_file):
        return dist_dir

    try:
        import embedded_dist
        print("[INFO] Pre-compiled web assets not found on disk. Unpacking automatically...")
        raw = base64.b64decode(embedded_dist.EMBEDDED_DIST_B64)
        with tarfile.open(fileobj=io.BytesIO(raw), mode='r:gz') as tar:
            tar.extractall(path=base)
        print("[OK] Web assets unpacked successfully into:", dist_dir)
        return dist_dir
    except Exception as e:
        print(f"[NOTE] Auto-extraction notice: {e}")
        return dist_dir

def get_dist_dir() -> str:
    """Finds directory containing index.html in bundled or portable modes."""
    # 1. Bundled in PyInstaller _MEIPASS
    if hasattr(sys, '_MEIPASS'):
        for sub in ['dist', '.']:
            p = os.path.join(sys._MEIPASS, sub)
            if os.path.isfile(os.path.join(p, 'index.html')):
                return p

    # 2. Make sure dist is extracted if running from source
    ensure_dist_exists()

    # 3. Relative to executable or script directory
    base = get_base_dir()
    for sub in ['dist', '.']:
        p = os.path.join(base, sub)
        if os.path.isfile(os.path.join(p, 'index.html')):
            return p

    # 4. Relative to current working directory
    for sub in ['dist', '.']:
        p = os.path.join(os.getcwd(), sub)
        if os.path.isfile(os.path.join(p, 'index.html')):
            return p

    return os.path.join(base, 'dist')

def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

class QuietHandler(SimpleHTTPRequestHandler):
    """
    HTTP Handler with strict MIME types to prevent Windows Registry
    from misidentifying .js as text/plain (which causes Chromium white screen).
    """
    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        strict_mimes = {
            '.js': 'application/javascript; charset=utf-8',
            '.mjs': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.html': 'text/html; charset=utf-8',
            '.htm': 'text/html; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.woff2': 'font/woff2',
            '.woff': 'font/woff',
            '.ttf': 'font/ttf',
        }
        if ext in strict_mimes:
            return strict_mimes[ext]
        return super().guess_type(path)

    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def log_message(self, format, *args):
        # Silence console log noise
        pass

    def do_GET(self):
        global last_heartbeat
        last_heartbeat = time.time()
        if self.path == '/api/heartbeat':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'OK')
            return
        super().do_GET()

    def do_POST(self):
        global server_running
        if self.path == '/api/exit':
            server_running = False
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'BYE')
            return
        self.send_response(404)
        self.end_headers()

def start_local_server(directory: str, port: int) -> ThreadingHTTPServer:
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=directory, **kwargs)
    httpd = ThreadingHTTPServer(('127.0.0.1', port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def find_system_browser() -> str:
    """Finds Edge, Chrome, or Brave executable on Windows with fallback."""
    import shutil
    for name in ["msedge", "msedge.exe", "chrome", "chrome.exe", "brave.exe"]:
        w = shutil.which(name)
        if w and os.path.isfile(w):
            return w

    candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    return ""

def main():
    global server_running

    # Handle --extract-only flag (used by batch builders)
    if "--extract-only" in sys.argv:
        ensure_dist_exists()
        print("[OK] Assets extracted successfully.")
        sys.exit(0)

    dist_dir = get_dist_dir()
    index_path = os.path.join(dist_dir, 'index.html')
    if not os.path.isfile(index_path):
        # Auto unpack if not found
        dist_dir = ensure_dist_exists()
        index_path = os.path.join(dist_dir, 'index.html')

    if not os.path.isfile(index_path):
        print(f"[ERROR] Could not find or unpack web files in '{dist_dir}'.")
        try:
            input("Press Enter to exit...")
        except Exception:
            pass
        sys.exit(1)

    port = find_free_port()
    server = start_local_server(dist_dir, port)
    app_url = f"http://127.0.0.1:{port}/"

    print("=================================================================")
    print("  VALO.LEVELING // MO2A PRIVATE EDITION")
    print(f"  Running at: {app_url}")
    print("=================================================================")

    # 1. Try PyWebView first if installed
    try:
        import webview
        ico_path = os.path.join(get_base_dir(), "valorant.ico")
        window = webview.create_window(
            title="VALO.LEVELING // MO2A PRIVATE",
            url=app_url,
            width=1280,
            height=820,
            min_size=(900, 600),
            background_color="#0F1923"
        )
        webview.start(icon=ico_path if os.path.exists(ico_path) else None)
        server.shutdown()
        return
    except (ImportError, Exception):
        pass

    # 2. Native Edge/Chrome/Brave application window mode
    browser_exe = find_system_browser()
    start_time = time.time()
    proc = None

    if browser_exe:
        user_data = os.path.join(tempfile.gettempdir(), "ValoLeveling_App_Profile")
        try:
            os.makedirs(user_data, exist_ok=True)
        except Exception:
            pass

        args = [
            browser_exe,
            f"--app={app_url}",
            f"--user-data-dir={user_data}",
            "--new-window",
            "--window-size=1280,820",
            "--window-position=center",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-mode",
            "--disable-extensions",
            "--disable-default-apps"
        ]
        try:
            proc = subprocess.Popen(args)
        except Exception as e:
            print(f"[NOTE] Native app mode launch note: {e}")
            proc = None

    if not proc:
        import webbrowser
        webbrowser.open(app_url)

    print("\n[OK] Application window opened. Close the window to exit.")

    # Keep server alive! Do NOT exit if Edge delegated to running process
    try:
        while server_running:
            time.sleep(1)
            # If proc was tracking the browser window and terminated after > 3s
            if proc is not None and proc.poll() is not None:
                elapsed = time.time() - start_time
                if elapsed > 3.0:
                    break
    except KeyboardInterrupt:
        pass
    finally:
        try:
            server.shutdown()
        except Exception:
            pass

if __name__ == "__main__":
    main()
