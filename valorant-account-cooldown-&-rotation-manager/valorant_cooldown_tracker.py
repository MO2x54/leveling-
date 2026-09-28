#!/usr/bin/env python3
"""
Valorant Account Cooldown & Rotation Manager
--------------------------------------------
A modern, dark-themed desktop application built with CustomTkinter
specifically designed to track 19-hour daily mission & account leveling cooldowns.

Key Features:
- 19-Hour Cooldown dynamic target timestamp countdown
- Persistent storage via local JSON (accounts.json) with atomic writes
- System time comparison against datetime.now() - never desyncs across restarts/sleep
- Auto-float expired/ready accounts to top, sorted by remaining time
- Instant clipboard copy for Username and Password
- Non-blocking 1-second GUI refresh loop using root.after()
- Add, Edit, Delete, Quick-Ready, and Reset controls
"""

import sys
import os
import json
import time
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from tkinter import filedialog, messagebox

try:
    import customtkinter as ctk
except ImportError:
    print("[ERROR] 'customtkinter' is not installed.")
    print("Please install it by running: pip install customtkinter pyperclip")
    sys.exit(1)

try:
    import pyperclip
    HAS_PYPERCLIP = True
except ImportError:
    HAS_PYPERCLIP = False

# Fix Windows Taskbar Grouping and Icon display
if sys.platform == "win32":
    try:
        import ctypes
        # Tells Windows this is an independent application on the taskbar with its own icon
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("VALO.LEVELING.MO2A.PRIVATE.1.0")
    except Exception:
        pass

# Import embedded icon provider
try:
    from valorant_ico_data import get_valorant_ico_path
except ImportError:
    def get_valorant_ico_path() -> str:
        return ""

def get_portable_dir() -> str:
    """Returns directory where the script or .exe resides to ensure 100% portability across devices."""
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

# Application Constants & Tactical Palette
APP_TITLE = "VALO.LEVELING // MO2A PRIVATE"
DEFAULT_COOLDOWN_HOURS = 19.0
DATA_FILE = os.path.join(get_portable_dir(), "accounts.json")

# Tactical Color Scheme
COLOR_BG = "#0F1923"          # Valorant Obsidian
COLOR_CARD = "#172430"        # Dark slate surface
COLOR_CARD_HOVER = "#1E2F3E"  # Hover highlight
COLOR_CARD_BORDER = "#253849" # Hairline border
COLOR_RED = "#FF4655"         # Valorant signature radiant red
COLOR_RED_HOVER = "#E03B49"   # Red hover
COLOR_GREEN = "#00E59B"       # Radiant Ready green
COLOR_GREEN_HOVER = "#00C985" # Green hover highlight
COLOR_AMBER = "#FFB800"       # Cooldown warning yellow/amber
COLOR_TEXT_PRIMARY = "#ECE8E1"# Off-white text
COLOR_TEXT_MUTED = "#8B97A2"  # Muted silver-grey text
COLOR_INPUT_BG = "#0B1218"    # Input box background

# Set global CustomTkinter appearance
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")


class AccountManager:
    """Handles persistent data storage and business logic for game accounts."""

    def __init__(self, filename: str = DATA_FILE):
        self.filename = filename
        self.accounts: List[Dict[str, Any]] = []
        self.load_data()

    def load_data(self) -> None:
        """Loads accounts from the local JSON file. Seeds default sample accounts if file is missing."""
        if not os.path.exists(self.filename):
            self.accounts = self.get_seed_accounts()
            self.save_data()
            return

        try:
            with open(self.filename, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    self.accounts = data
                else:
                    self.accounts = []
        except Exception as e:
            print(f"[WARN] Failed to parse {self.filename}: {e}. Creating backup.")
            self.accounts = self.get_seed_accounts()
            self.save_data()

    def save_data(self) -> None:
        """Performs atomic write to avoid data corruption if closed abruptly."""
        temp_file = f"{self.filename}.tmp"
        try:
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(self.accounts, f, indent=2, ensure_ascii=False)
            os.replace(temp_file, self.filename)
        except Exception as e:
            print(f"[ERROR] Failed to save accounts data: {e}")

    def export_backup(self, target_filepath: str) -> bool:
        """Exports full account database to a portable JSON backup file."""
        try:
            with open(target_filepath, "w", encoding="utf-8") as f:
                json.dump(self.accounts, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ERROR] Failed to export backup: {e}")
            return False

    def import_backup(self, source_filepath: str) -> int:
        """Imports account database from any JSON backup file with auto-compatibility."""
        try:
            with open(source_filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, list):
                    return -1
                imported = []
                for item in data:
                    imported.append({
                        "id": item.get("id") or str(uuid.uuid4()),
                        "name": item.get("name") or "Imported Account",
                        "username": item.get("username", ""),
                        "password": item.get("password", ""),
                        "region": item.get("region", "NA"),
                        "notes": item.get("notes", ""),
                        "target_end_time": item.get("target_end_time") or item.get("targetEndTime"),
                        "cooldown_duration_hours": float(item.get("cooldown_duration_hours") or item.get("cooldownDurationHours") or DEFAULT_COOLDOWN_HOURS),
                        "last_started_at": item.get("last_started_at") or item.get("lastStartedAt"),
                        "current_level": int(item.get("current_level") or item.get("currentLevel") or 20),
                    })
                self.accounts = imported
                self.save_data()
                return len(imported)
        except Exception as e:
            print(f"[ERROR] Failed to import backup: {e}")
            return -1

    @staticmethod
    def get_seed_accounts() -> List[Dict[str, Any]]:
        """Provides sample initial accounts for immediate demonstration."""
        now = datetime.now()
        cooldown_1 = now + timedelta(hours=14, minutes=32, seconds=10)
        cooldown_2 = now + timedelta(hours=3, minutes=15, seconds=0)
        ready_time = now - timedelta(hours=1)

        return [
            {
                "id": str(uuid.uuid4()),
                "name": "Reyna Smurf AP",
                "username": "reyna_ap_01",
                "password": "RadiantPassword99!",
                "region": "AP",
                "notes": "Ascendant 2 / Daily missions priority",
                "target_end_time": ready_time.isoformat(),
                "cooldown_duration_hours": 19.0,
                "last_started_at": (ready_time - timedelta(hours=19)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Viper Leveling NA",
                "username": "viper_na_grind",
                "password": "SnakeBitePass2026#",
                "region": "NA",
                "notes": "Account Level 18 - 2 levels to competitive",
                "target_end_time": cooldown_2.isoformat(),
                "cooldown_duration_hours": 19.0,
                "last_started_at": (cooldown_2 - timedelta(hours=19)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Jett Main EUW",
                "username": "jett_tailwind_eu",
                "password": "WindPassKey887!",
                "region": "EU",
                "notes": "Daily AP bonus reset",
                "target_end_time": cooldown_1.isoformat(),
                "cooldown_duration_hours": 19.0,
                "last_started_at": (cooldown_1 - timedelta(hours=19)).isoformat(),
            }
        ]

    def add_account(self, name: str, username: str, password: str,
                    region: str = "NA", notes: str = "", start_timer_now: bool = False,
                    cooldown_hours: float = DEFAULT_COOLDOWN_HOURS,
                    current_level: int = 20) -> Dict[str, Any]:
        """Creates and appends a new account."""
        now = datetime.now()
        target = now + timedelta(hours=cooldown_hours) if start_timer_now else None

        new_acc = {
            "id": str(uuid.uuid4()),
            "name": name.strip(),
            "username": username.strip(),
            "password": password.strip(),
            "region": region.strip().upper(),
            "notes": notes.strip(),
            "target_end_time": target.isoformat() if target else None,
            "cooldown_duration_hours": cooldown_hours,
            "last_started_at": now.isoformat() if start_timer_now else None,
            "currentLevel": current_level
        }
        self.accounts.append(new_acc)
        self.save_data()
        return new_acc

    def update_account(self, acc_id: str, **kwargs) -> bool:
        """Updates account properties by ID."""
        for acc in self.accounts:
            if acc["id"] == acc_id:
                for k, v in kwargs.items():
                    acc[k] = v
                self.save_data()
                return True
        return False

    def delete_account(self, acc_id: str) -> bool:
        """Deletes an account by ID."""
        initial_len = len(self.accounts)
        self.accounts = [a for a in self.accounts if a["id"] != acc_id]
        if len(self.accounts) != initial_len:
            self.save_data()
            return True
        return False

    def trigger_cooldown(self, acc_id: str, hours: Optional[float] = None) -> bool:
        """Sets the exact target timestamp calculated dynamically against datetime.now()."""
        for acc in self.accounts:
            if acc["id"] == acc_id:
                dur = hours if hours is not None else acc.get("cooldown_duration_hours", DEFAULT_COOLDOWN_HOURS)
                now = datetime.now()
                target = now + timedelta(hours=dur)
                acc["target_end_time"] = target.isoformat()
                acc["last_started_at"] = now.isoformat()
                acc["cooldown_duration_hours"] = dur
                self.save_data()
                return True
        return False

    def mark_ready_now(self, acc_id: str) -> bool:
        """Manually forces an account to Ready state."""
        for acc in self.accounts:
            if acc["id"] == acc_id:
                # Setting target_end_time to 1 second in the past marks it Ready
                past = datetime.now() - timedelta(seconds=1)
                acc["target_end_time"] = past.isoformat()
                self.save_data()
                return True
        return False

    def clear_cooldown(self, acc_id: str) -> bool:
        """Resets cooldown to idle/ready state."""
        for acc in self.accounts:
            if acc["id"] == acc_id:
                acc["target_end_time"] = None
                self.save_data()
                return True
        return False

    @staticmethod
    def get_time_info(account: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dynamically compares stored target_end_time against datetime.now().
        Returns:
            - is_ready (bool)
            - remaining_seconds (float)
            - formatted_str (str): '18h 42m 19s' or 'READY TO PLAY'
            - progress_percent (float): 0.0 to 1.0
            - target_dt (datetime or None)
        """
        target_str = account.get("target_end_time")
        if not target_str:
            return {
                "is_ready": True,
                "remaining_seconds": 0.0,
                "formatted_str": "READY",
                "progress_percent": 1.0,
                "target_dt": None
            }

        try:
            target_dt = datetime.fromisoformat(target_str)
        except Exception:
            return {
                "is_ready": True,
                "remaining_seconds": 0.0,
                "formatted_str": "READY",
                "progress_percent": 1.0,
                "target_dt": None
            }

        diff = (target_dt - datetime.now()).total_seconds()

        if diff <= 0:
            return {
                "is_ready": True,
                "remaining_seconds": 0.0,
                "formatted_str": "READY",
                "progress_percent": 1.0,
                "target_dt": target_dt
            }

        # Calculate remaining hours, minutes, seconds
        hours = int(diff // 3600)
        minutes = int((diff % 3600) // 60)
        seconds = int(diff % 60)
        formatted = f"{hours:02d}h {minutes:02d}m {seconds:02d}s"

        # Calculate progress if last_started_at is available
        total_seconds = account.get("cooldown_duration_hours", DEFAULT_COOLDOWN_HOURS) * 3600.0
        elapsed_seconds = total_seconds - diff
        progress = max(0.0, min(1.0, elapsed_seconds / total_seconds if total_seconds > 0 else 1.0))

        return {
            "is_ready": False,
            "remaining_seconds": diff,
            "formatted_str": formatted,
            "progress_percent": progress,
            "target_dt": target_dt
        }

    def get_sorted_accounts(self, search_query: str = "", filter_status: str = "ALL") -> List[Dict[str, Any]]:
        """
        Filters and sorts accounts:
        1. Ready accounts float to the top
        2. Active cooldown accounts sorted ascending by remaining time (soonest first)
        """
        filtered = []
        q = search_query.strip().lower()

        for acc in self.accounts:
            info = self.get_time_info(acc)
            acc_is_ready = info["is_ready"]

            if filter_status == "READY" and not acc_is_ready:
                continue
            if filter_status == "COOLDOWN" and acc_is_ready:
                continue

            if q:
                match = (
                    q in acc.get("name", "").lower() or
                    q in acc.get("username", "").lower() or
                    q in acc.get("region", "").lower() or
                    q in acc.get("notes", "").lower()
                )
                if not match:
                    continue

            filtered.append((acc, info))

        # Sort key:
        # Tuple: (0 if ready else 1, remaining_seconds)
        def sort_key(item):
            acc, info = item
            if info["is_ready"]:
                return (0, 0.0)
            return (1, info["remaining_seconds"])

        filtered.sort(key=sort_key)
        return [item[0] for item in filtered]


class AccountRowCard(ctk.CTkFrame):
    """Modern dark card representing a single account row."""

    def __init__(self, master, account: Dict[str, Any], manager: AccountManager,
                 on_action_callback, notify_status_callback, **kwargs):
        super().__init__(master, fg_color=COLOR_CARD, corner_radius=8,
                         border_width=1, border_color=COLOR_CARD_BORDER, **kwargs)
        self.account = account
        self.manager = manager
        self.on_action = on_action_callback
        self.notify = notify_status_callback
        self.show_password = False

        # Performance optimization flags to prevent GUI lag and stuttering
        self._last_is_ready = None
        self._last_time_str = ""
        self._last_target_str = ""
        self._last_progress = -1.0

        self.setup_ui()

    def setup_ui(self):
        # Configure grid columns
        self.grid_columnconfigure(0, weight=3) # Account info
        self.grid_columnconfigure(1, weight=2) # Countdown & progress
        self.grid_columnconfigure(2, weight=0) # Action buttons

        # --- Column 0: Account Details ---
        self.info_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.info_frame.grid(row=0, column=0, padx=14, pady=12, sticky="w")

        # Name & Region
        self.title_frame = ctk.CTkFrame(self.info_frame, fg_color="transparent")
        self.title_frame.pack(anchor="w")

        # Quick Checkbox to trigger countdown
        self.chk_var = ctk.BooleanVar(value=not self.manager.get_time_info(self.account)["is_ready"])
        self.chk_box = ctk.CTkCheckBox(
            self.title_frame,
            text="",
            width=22,
            checkbox_width=20,
            checkbox_height=20,
            corner_radius=4,
            fg_color=COLOR_GREEN,
            hover_color=COLOR_GREEN_HOVER,
            border_color="#3A4D60",
            variable=self.chk_var,
            command=self.handle_checkbox_toggle
        )
        self.chk_box.pack(side="left", padx=(0, 6))

        self.name_label = ctk.CTkLabel(
            self.title_frame,
            text=self.account.get("name", "Account"),
            font=ctk.CTkFont(family="Segoe UI", size=15, weight="bold"),
            text_color=COLOR_TEXT_PRIMARY
        )
        self.name_label.pack(side="left")

        region_code = self.account.get("region", "NA")
        self.region_badge = ctk.CTkLabel(
            self.title_frame,
            text=f"[{region_code}]",
            font=ctk.CTkFont(family="Consolas", size=11, weight="bold"),
            text_color="#64748B"
        )
        self.region_badge.pack(side="left", padx=6)

        # Manual Level Controller
        self.lvl_frame = ctk.CTkFrame(self.title_frame, fg_color="#182531", corner_radius=4)
        self.lvl_frame.pack(side="left", padx=4)

        self.btn_dec_lvl = ctk.CTkButton(
            self.lvl_frame,
            text="-",
            width=20,
            height=18,
            font=ctk.CTkFont(size=11, weight="bold"),
            fg_color="transparent",
            hover_color="#223344",
            text_color="#8B97A2",
            command=self.dec_level
        )
        self.btn_dec_lvl.pack(side="left", padx=1)

        cur_lvl = self.account.get("currentLevel", 20)
        self.lbl_level = ctk.CTkLabel(
            self.lvl_frame,
            text=f"Lvl {cur_lvl}",
            font=ctk.CTkFont(family="Consolas", size=11, weight="bold"),
            text_color=COLOR_GREEN if cur_lvl >= 20 else COLOR_AMBER,
            cursor="hand2"
        )
        self.lbl_level.pack(side="left", padx=2)
        self.lbl_level.bind("<Button-1>", lambda e: self.edit_level_dialog())

        self.btn_inc_lvl = ctk.CTkButton(
            self.lvl_frame,
            text="+",
            width=20,
            height=18,
            font=ctk.CTkFont(size=11, weight="bold"),
            fg_color="transparent",
            hover_color="#223344",
            text_color="#8B97A2",
            command=self.inc_level
        )
        self.btn_inc_lvl.pack(side="left", padx=1)

        # Username & Notes
        self.sub_label = ctk.CTkLabel(
            self.info_frame,
            text=f"User: {self.account.get('username', '')}" + (f"  •  {self.account.get('notes', '')}" if self.account.get("notes") else ""),
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color=COLOR_TEXT_MUTED
        )
        self.sub_label.pack(anchor="w", pady=(2, 0))

        # --- Column 1: Countdown & Progress ---
        self.timer_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.timer_frame.grid(row=0, column=1, padx=14, pady=12, sticky="ew")

        # Status text + Time
        self.status_header = ctk.CTkFrame(self.timer_frame, fg_color="transparent")
        self.status_header.pack(fill="x")

        self.status_label = ctk.CTkLabel(
            self.status_header,
            text="...",
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold")
        )
        self.status_label.pack(side="left")

        self.target_time_label = ctk.CTkLabel(
            self.status_header,
            text="",
            font=ctk.CTkFont(family="Consolas", size=11),
            text_color=COLOR_TEXT_MUTED
        )
        self.target_time_label.pack(side="right")

        # Progress bar
        self.progress_bar = ctk.CTkProgressBar(
            self.timer_frame,
            height=6,
            corner_radius=3,
            fg_color="#0F1923",
            progress_color=COLOR_RED
        )
        self.progress_bar.pack(fill="x", pady=(6, 0))

        # --- Column 2: Tactical Action Buttons ---
        self.actions_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.actions_frame.grid(row=0, column=2, padx=14, pady=12, sticky="e")

        # Start / Reset Cooldown
        self.btn_timer = ctk.CTkButton(
            self.actions_frame,
            text="START 19H",
            width=96,
            height=32,
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            fg_color=COLOR_RED,
            hover_color=COLOR_RED_HOVER,
            command=self.handle_timer_click
        )
        self.btn_timer.pack(side="left", padx=4)

        # Copy Username
        self.btn_copy_user = ctk.CTkButton(
            self.actions_frame,
            text="COPY USER",
            width=86,
            height=32,
            font=ctk.CTkFont(family="Segoe UI", size=11),
            fg_color="#203040",
            hover_color="#2B4055",
            command=self.copy_username
        )
        self.btn_copy_user.pack(side="left", padx=4)

        # Copy Password
        self.btn_copy_pass = ctk.CTkButton(
            self.actions_frame,
            text="COPY PASS",
            width=86,
            height=32,
            font=ctk.CTkFont(family="Segoe UI", size=11),
            fg_color="#203040",
            hover_color="#2B4055",
            command=self.copy_password
        )
        self.btn_copy_pass.pack(side="left", padx=4)

        # Extra options menu button (Edit, Ready, Delete)
        self.btn_more = ctk.CTkButton(
            self.actions_frame,
            text="•••",
            width=36,
            height=32,
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            fg_color="#182531",
            hover_color="#26384A",
            command=self.show_account_menu
        )
        self.btn_more.pack(side="left", padx=4)

        # Initial tick
        self.update_display()

    def update_display(self) -> bool:
        """
        Recalculates time from target_end_time.
        Optimized to avoid unnecessary widget reconfiguration (eliminates GUI lag/stutter).
        """
        info = self.manager.get_time_info(self.account)
        is_ready = info["is_ready"]
        dur = float(self.account.get("cooldown_duration_hours") or self.account.get("cooldownDurationHours") or DEFAULT_COOLDOWN_HOURS)
        dur_display = f"{int(dur)}H" if dur.is_integer() else f"{dur}H"

        if is_ready:
            if self._last_is_ready is not True:
                self._last_is_ready = True
                self.status_label.configure(text="READY TO PLAY", text_color=COLOR_GREEN)
                self.target_time_label.configure(text=f"{dur_display} Reset Ready")
                self.progress_bar.set(1.0)
                self.progress_bar.configure(progress_color=COLOR_GREEN)
                self.btn_timer.configure(text=f"START {dur_display}", fg_color=COLOR_RED, hover_color=COLOR_RED_HOVER)
                self.chk_var.set(False)
                self.configure(border_color="#00E59B")
        else:
            if self._last_is_ready is not False:
                self._last_is_ready = False
                self.progress_bar.configure(progress_color=COLOR_RED)
                self.btn_timer.configure(text="RESET TIMER", fg_color="#334155", hover_color="#475569")
                self.chk_var.set(True)
                self.configure(border_color=COLOR_CARD_BORDER)

            time_str = info["formatted_str"]
            if time_str != self._last_time_str:
                self._last_time_str = time_str
                self.status_label.configure(text=time_str, text_color=COLOR_AMBER)

            target_dt = info["target_dt"]
            target_str = f"Ends: {target_dt.strftime('%H:%M:%S')}" if target_dt else ""
            if target_str != self._last_target_str:
                self._last_target_str = target_str
                self.target_time_label.configure(text=target_str)

            prog = round(info["progress_percent"], 3)
            if prog != self._last_progress:
                self._last_progress = prog
                self.progress_bar.set(prog)

        return is_ready

    def dec_level(self):
        """Decrements account level by 1."""
        cur = self.account.get("currentLevel", 20)
        if cur > 1:
            self.account["currentLevel"] = cur - 1
            self.manager.save_data()
            new_val = self.account["currentLevel"]
            self.lbl_level.configure(
                text=f"Lvl {new_val}",
                text_color=COLOR_GREEN if new_val >= 20 else COLOR_AMBER
            )
            self.notify(f"Level for '{self.account['name']}' set to {new_val}")

    def inc_level(self):
        """Increments account level by 1."""
        cur = self.account.get("currentLevel", 20)
        self.account["currentLevel"] = cur + 1
        self.manager.save_data()
        new_val = self.account["currentLevel"]
        self.lbl_level.configure(
            text=f"Lvl {new_val}",
            text_color=COLOR_GREEN if new_val >= 20 else COLOR_AMBER
        )
        self.notify(f"Level for '{self.account['name']}' set to {new_val}")

    def edit_level_dialog(self):
        """Opens quick input dialog to set exact level."""
        import tkinter.simpledialog as sd
        res = sd.askinteger(
            "Account Level",
            f"Enter level for '{self.account['name']}':",
            initialvalue=self.account.get("currentLevel", 20),
            minvalue=1,
            maxvalue=9999
        )
        if res is not None:
            self.account["currentLevel"] = res
            self.manager.save_data()
            self.lbl_level.configure(
                text=f"Lvl {res}",
                text_color=COLOR_GREEN if res >= 20 else COLOR_AMBER
            )
            self.notify(f"Level for '{self.account['name']}' set to {res}")

    def handle_checkbox_toggle(self):
        """Called when the user clicks the checkmark on the account card."""
        info = self.manager.get_time_info(self.account)
        dur = float(self.account.get("cooldown_duration_hours") or self.account.get("cooldownDurationHours") or DEFAULT_COOLDOWN_HOURS)
        if self.chk_var.get():
            # Checkbox marked -> Start countdown immediately using configured hours
            self.manager.trigger_cooldown(self.account["id"], dur)
            self.notify(f"Countdown started for '{self.account['name']}' ({dur} Hours)")
        else:
            # Checkbox unmarked -> Mark ready / reset
            self.manager.mark_ready(self.account["id"])
            self.notify(f"Reset '{self.account['name']}' to Ready state")
        self.on_action()

    def handle_timer_click(self):
        """Starts or resets countdown using configured duration."""
        acc_id = self.account["id"]
        info = self.manager.get_time_info(self.account)
        if info["is_ready"]:
            dur = float(self.account.get("cooldown_duration_hours") or self.account.get("cooldownDurationHours") or DEFAULT_COOLDOWN_HOURS)
            self.manager.trigger_cooldown(acc_id, dur)
            self.notify(f"{dur}-Hour cooldown set for '{self.account['name']}'")
        else:
            self.manager.mark_ready(acc_id)
            self.notify(f"Reset '{self.account['name']}' to Ready state")
        self.on_action()

    def copy_username(self):
        user = self.account.get("username", "")
        self.copy_to_clipboard(user)
        self.notify(f"Copied username '{user}' to clipboard")

    def copy_password(self):
        pwd = self.account.get("password", "")
        self.copy_to_clipboard(pwd)
        self.notify(f"Copied password for '{self.account['name']}' to clipboard")

    def copy_to_clipboard(self, text: str):
        if HAS_PYPERCLIP:
            try:
                pyperclip.copy(text)
                return
            except Exception:
                pass
        # Fallback to Tkinter clipboard
        self.clipboard_clear()
        self.clipboard_append(text)
        self.update()

    def show_account_menu(self):
        """Opens a quick context dialog with Edit, Mark Ready, and Delete options."""
        menu_window = ctk.CTkToplevel(self)
        menu_window.title("Account Options")
        menu_window.geometry("300x240")
        menu_window.resizable(False, False)
        menu_window.grab_set()

        # Center dialog relative to main app
        menu_window.transient(self.winfo_toplevel())

        lbl = ctk.CTkLabel(
            menu_window,
            text=f"Manage: {self.account['name']}",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLOR_TEXT_PRIMARY
        )
        lbl.pack(pady=(16, 12))

        # Button: Mark Ready Now
        btn_ready = ctk.CTkButton(
            menu_window,
            text="Mark Ready Immediately",
            fg_color="#059669",
            hover_color="#10B981",
            command=lambda: [self.manager.mark_ready_now(self.account["id"]),
                             menu_window.destroy(),
                             self.on_action(),
                             self.notify(f"'{self.account['name']}' marked READY")]
        )
        btn_ready.pack(fill="x", padx=20, pady=4)

        # Button: Edit Account
        btn_edit = ctk.CTkButton(
            menu_window,
            text="Edit Details & Credentials",
            fg_color="#2563EB",
            hover_color="#3B82F6",
            command=lambda: [menu_window.destroy(), self.open_edit_dialog()]
        )
        btn_edit.pack(fill="x", padx=20, pady=4)

        # Button: Delete Account
        btn_delete = ctk.CTkButton(
            menu_window,
            text="Delete Account",
            fg_color="#991B1B",
            hover_color="#DC2626",
            command=lambda: [self.manager.delete_account(self.account["id"]),
                             menu_window.destroy(),
                             self.on_action(),
                             self.notify(f"Deleted account '{self.account['name']}'")]
        )
        btn_delete.pack(fill="x", padx=20, pady=4)

        # Close
        btn_close = ctk.CTkButton(
            menu_window,
            text="Cancel",
            fg_color="#334155",
            hover_color="#475569",
            command=menu_window.destroy
        )
        btn_close.pack(fill="x", padx=20, pady=(8, 12))

    def open_edit_dialog(self):
        AccountEditDialog(self.winfo_toplevel(), self.account, self.manager, self.on_action, self.notify)


class AccountEditDialog(ctk.CTkToplevel):
    """Dialog for creating or editing accounts."""

    def __init__(self, parent, account: Optional[Dict[str, Any]], manager: AccountManager,
                 on_success, notify_callback):
        super().__init__(parent)
        self.account = account
        self.manager = manager
        self.on_success = on_success
        self.notify = notify_callback

        is_edit = account is not None
        self.title("Edit Account" if is_edit else "Add Valorant Account")
        self.geometry("420x530")
        self.resizable(False, False)
        self.grab_set()
        self.transient(parent)

        self.setup_ui(is_edit)

    def setup_ui(self, is_edit: bool):
        pad_x = 24

        # Header Title
        title_txt = "EDIT ACCOUNT" if is_edit else "ADD NEW VALORANT ACCOUNT"
        lbl_head = ctk.CTkLabel(
            self,
            text=title_txt,
            font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold"),
            text_color=COLOR_RED
        )
        lbl_head.pack(pady=(20, 16))

        # Form Inputs
        self.entry_name = self.create_field("Account Name / Nickname (Optional - Defaults to Username)", self.account.get("name", "") if is_edit else "", pad_x)
        self.entry_user = self.create_field("Riot Username / Login ID", self.account.get("username", "") if is_edit else "", pad_x)
        # Password Input
        self.entry_pass = self.create_field("Password", self.account.get("password", "") if is_edit else "", pad_x, show="*")

        # Level Input
        self.entry_level = self.create_field("Account Level (e.g. 20 for Ranked)", str(self.account.get("currentLevel", 20)) if is_edit else "20", pad_x)

        # Quick-Fill button if there is a known recent password
        if not is_edit:
            recent_passwords = [a.get("password", "") for a in self.manager.accounts if a.get("password")]
            if recent_passwords:
                last_used = recent_passwords[-1]
                quick_btn = ctk.CTkButton(
                    self,
                    text=f"🔑 Auto-fill Last Password ({last_used[:10]}...)",
                    height=24,
                    font=ctk.CTkFont(size=11),
                    fg_color="#182531",
                    hover_color="#223344",
                    command=lambda: [self.entry_pass.delete(0, "end"), self.entry_pass.insert(0, last_used)]
                )
                quick_btn.pack(anchor="w", padx=pad_x, pady=(0, 6))

        # Region & Notes Frame
        sub_frame = ctk.CTkFrame(self, fg_color="transparent")
        sub_frame.pack(fill="x", padx=pad_x, pady=6)

        ctk.CTkLabel(sub_frame, text="Region:", font=ctk.CTkFont(size=12, weight="bold")).pack(side="left", padx=(0, 8))
        self.region_combo = ctk.CTkComboBox(
            sub_frame,
            values=["NA", "EU", "AP", "KR", "BR", "LATAM"],
            width=90
        )
        self.region_combo.set(self.account.get("region", "NA") if is_edit else "NA")
        self.region_combo.pack(side="left")

        self.entry_notes = self.create_field("Notes (e.g. Current Level, Rank, Missions)",
                                             self.account.get("notes", "") if is_edit else "", pad_x)

        # Cooldown duration in hours (Default: 19.0)
        curr_dur = str(self.account.get("cooldown_duration_hours") or self.account.get("cooldownDurationHours") or 19.0) if is_edit else "19.0"
        self.entry_dur = self.create_field("Cooldown Duration in Hours (Default: 19)", curr_dur, pad_x)

        # Checkbox for start timer immediately if new
        self.start_timer_var = ctk.BooleanVar(value=False)
        if not is_edit:
            self.cb_start = ctk.CTkCheckBox(
                self,
                text="Start cooldown countdown immediately upon saving",
                variable=self.start_timer_var,
                font=ctk.CTkFont(size=12)
            )
            self.cb_start.pack(padx=pad_x, pady=(10, 6), anchor="w")

        # Action Buttons
        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(fill="x", padx=pad_x, pady=(20, 16))

        btn_save = ctk.CTkButton(
            btn_frame,
            text="SAVE ACCOUNT",
            fg_color=COLOR_RED,
            hover_color=COLOR_RED_HOVER,
            height=36,
            command=self.save_account
        )
        btn_save.pack(side="right", padx=(8, 0))

        btn_cancel = ctk.CTkButton(
            btn_frame,
            text="Cancel",
            fg_color="#334155",
            hover_color="#475569",
            height=36,
            command=self.destroy
        )
        btn_cancel.pack(side="right")

    def create_field(self, label_text: str, default_val: str, pad_x: int, show: str = ""):
        lbl = ctk.CTkLabel(
            self,
            text=label_text,
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            text_color=COLOR_TEXT_MUTED
        )
        lbl.pack(anchor="w", padx=pad_x, pady=(6, 2))

        entry = ctk.CTkEntry(
            self,
            height=34,
            fg_color=COLOR_INPUT_BG,
            border_color=COLOR_CARD_BORDER,
            show=show
        )
        if default_val:
            entry.insert(0, default_val)
        entry.pack(fill="x", padx=pad_x, pady=(0, 4))
        return entry

    def save_account(self):
        name = self.entry_name.get().strip()
        user = self.entry_user.get().strip()
        pwd = self.entry_pass.get().strip()
        region = self.region_combo.get()
        notes = self.entry_notes.get().strip()
        lvl_str = self.entry_level.get().strip()
        dur_str = self.entry_dur.get().strip()
        try:
            level_val = max(1, int(lvl_str))
        except ValueError:
            level_val = 20
        try:
            dur_val = max(0.1, float(dur_str))
        except ValueError:
            dur_val = 19.0

        if not user:
            self.notify("Please fill in the Riot Username")
            return

        if not name:
            name = user

        if self.account:
            # Updating existing account
            self.manager.update_account(
                self.account["id"],
                name=name,
                username=user,
                password=pwd,
                region=region,
                notes=notes,
                currentLevel=level_val,
                cooldown_duration_hours=dur_val
            )
            self.notify(f"Updated account '{name}' (Lvl {level_val}, {dur_val}h)")
        else:
            # Creating new account
            self.manager.add_account(
                name=name,
                username=user,
                password=pwd,
                region=region,
                notes=notes,
                start_timer_now=self.start_timer_var.get(),
                cooldown_hours=dur_val,
                current_level=level_val
            )
            self.notify(f"Added new account '{name}' (Lvl {level_val}, {dur_val}h)")

        self.on_success()
        self.destroy()


class BulkAccountDialog(ctk.CTkToplevel):
    """Dialog for quickly adding multiple accounts with a shared single password."""

    def __init__(self, parent, manager: AccountManager, on_success, notify_callback):
        super().__init__(parent)
        self.manager = manager
        self.on_success = on_success
        self.notify = notify_callback

        self.title("Bulk Add Accounts (Shared Password)")
        self.geometry("480x540")
        self.resizable(False, False)
        self.grab_set()
        self.transient(parent)

        self.setup_ui()

    def setup_ui(self):
        pad_x = 24

        lbl_head = ctk.CTkLabel(
            self,
            text="BULK ADD ACCOUNTS (SHARED PASSWORD)",
            font=ctk.CTkFont(family="Segoe UI", size=15, weight="bold"),
            text_color="#00E59B"
        )
        lbl_head.pack(pady=(18, 8))

        lbl_desc = ctk.CTkLabel(
            self,
            text="Enter one shared password, then paste all usernames (one per line).\nAll accounts will be registered instantly with the same password!",
            font=ctk.CTkFont(size=11),
            text_color=COLOR_TEXT_MUTED
        )
        lbl_desc.pack(padx=pad_x, pady=(0, 12))

        # Shared Password
        ctk.CTkLabel(self, text="Shared Password (كلمة المرور المشتركة):", font=ctk.CTkFont(size=12, weight="bold")).pack(anchor="w", padx=pad_x, pady=(4, 2))
        self.entry_pass = ctk.CTkEntry(
            self,
            height=34,
            fg_color=COLOR_INPUT_BG,
            border_color=COLOR_CARD_BORDER
        )
        # Pre-fill with recent password if available
        recent = [a.get("password") for a in self.manager.accounts if a.get("password")]
        if recent:
            self.entry_pass.insert(0, recent[-1])
        self.entry_pass.pack(fill="x", padx=pad_x, pady=(0, 8))

        # Usernames text box (one per line)
        ctk.CTkLabel(self, text="Usernames (قائمة اليوزرات - يوزر في كل سطر):", font=ctk.CTkFont(size=12, weight="bold")).pack(anchor="w", padx=pad_x, pady=(4, 2))
        self.text_users = ctk.CTkTextbox(
            self,
            height=130,
            fg_color=COLOR_INPUT_BG,
            border_color=COLOR_CARD_BORDER,
            font=ctk.CTkFont(family="Consolas", size=12)
        )
        self.text_users.pack(fill="x", padx=pad_x, pady=(0, 8))

        # Name prefix & Region
        sub_frame = ctk.CTkFrame(self, fg_color="transparent")
        sub_frame.pack(fill="x", padx=pad_x, pady=4)

        ctk.CTkLabel(sub_frame, text="Prefix:", font=ctk.CTkFont(size=12, weight="bold")).pack(side="left", padx=(0, 6))
        self.entry_prefix = ctk.CTkEntry(sub_frame, width=130, height=32, placeholder_text="Smurf")
        self.entry_prefix.insert(0, "Smurf")
        self.entry_prefix.pack(side="left", padx=(0, 14))

        ctk.CTkLabel(sub_frame, text="Region:", font=ctk.CTkFont(size=12, weight="bold")).pack(side="left", padx=(0, 6))
        self.region_combo = ctk.CTkComboBox(sub_frame, values=["NA", "EU", "AP", "KR", "BR", "LATAM"], width=85, height=32)
        self.region_combo.set("NA")
        self.region_combo.pack(side="left")

        ctk.CTkLabel(sub_frame, text="Hours:", font=ctk.CTkFont(size=12, weight="bold")).pack(side="left", padx=(10, 6))
        self.entry_dur = ctk.CTkEntry(sub_frame, width=50, height=32)
        self.entry_dur.insert(0, "19")
        self.entry_dur.pack(side="left")

        # Start timer checkbox
        self.cb_start_var = ctk.BooleanVar(value=False)
        self.cb_start = ctk.CTkCheckBox(
            self,
            text="Start cooldown countdown on all accounts immediately",
            variable=self.cb_start_var,
            font=ctk.CTkFont(size=12)
        )
        self.cb_start.pack(padx=pad_x, pady=(10, 10), anchor="w")

        # Action Buttons
        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(fill="x", padx=pad_x, pady=(12, 16))

        btn_save = ctk.CTkButton(
            btn_frame,
            text="CREATE ALL ACCOUNTS",
            fg_color="#00E59B",
            hover_color="#00C786",
            text_color="#000000",
            font=ctk.CTkFont(weight="bold"),
            height=36,
            command=self.save_bulk_accounts
        )
        btn_save.pack(side="right", padx=(8, 0))

        btn_cancel = ctk.CTkButton(
            btn_frame,
            text="Cancel",
            fg_color="#334155",
            hover_color="#475569",
            height=36,
            command=self.destroy
        )
        btn_cancel.pack(side="right")

    def save_bulk_accounts(self):
        pwd = self.entry_pass.get().strip()
        lines = self.text_users.get("1.0", "end").strip().split("\n")
        usernames = [line.strip() for line in lines if line.strip()]
        prefix = self.entry_prefix.get().strip() or "Account"
        region = self.region_combo.get()
        start_now = self.cb_start_var.get()
        dur_str = self.entry_dur.get().strip()
        try:
            dur_val = max(0.1, float(dur_str))
        except ValueError:
            dur_val = 19.0

        if not pwd:
            self.notify("Error: Please provide a shared password.")
            return

        if not usernames:
            self.notify("Error: Please enter at least one username.")
            return

        added_count = 0
        for i, raw_user in enumerate(usernames, 1):
            if ":" in raw_user:
                name, user = raw_user.split(":", 1)
                name, user = name.strip(), user.strip()
            else:
                user = raw_user
                clean = raw_user.split("#")[0]
                name = f"{prefix} #{i} ({clean})"

            self.manager.add_account(
                name=name,
                username=user,
                password=pwd,
                region=region,
                notes="Bulk added (shared password)",
                start_timer_now=start_now,
                cooldown_hours=dur_val
            )
            added_count += 1

        self.notify(f"Successfully added {added_count} accounts with shared password!")
        self.on_success()
        self.destroy()


class ValorantCooldownApp(ctk.CTk):
    """Main Valorant Cooldown Desktop Application Window."""

    def __init__(self):
        super().__init__()

        self.title(APP_TITLE)
        self.geometry("980x640")
        self.minsize(820, 520)
        self.configure(fg_color=COLOR_BG)

        # Extract and set window & taskbar icon
        ico_file = get_valorant_ico_path()
        if ico_file and os.path.exists(ico_file):
            try:
                self.iconbitmap(ico_file)
            except Exception:
                pass
            try:
                # Also set iconphoto via PIL if available for taskbar compatibility
                from PIL import Image, ImageTk
                ico_img = Image.open(ico_file)
                self._app_icon_photo = ImageTk.PhotoImage(ico_img)
                self.iconphoto(False, self._app_icon_photo)
            except Exception:
                pass

        self.manager = AccountManager()
        self.row_widgets: List[AccountRowCard] = []
        self.current_filter = "ALL"
        self.search_query = ""
        self.last_ready_account_ids = set()

        self.setup_header()
        self.setup_metrics_bar()
        self.setup_filter_bar()
        self.setup_account_list_view()
        self.setup_status_footer()

        # Build account rows
        self.refresh_account_list()

        # Start non-blocking safe 1-second update loop
        self.update_tick_loop()

    def setup_header(self):
        """Top Tactical Navigation Bar."""
        self.header_frame = ctk.CTkFrame(self, fg_color="#121D28", height=56, corner_radius=0)
        self.header_frame.pack(fill="x", side="top")
        self.header_frame.pack_propagate(False)

        # Brand / Title with Authentic Valorant V Emblem
        title_box = ctk.CTkFrame(self.header_frame, fg_color="transparent")
        title_box.pack(side="left", padx=20, pady=10)

        # Authentic Valorant Logo Canvas
        import tkinter as tk
        try:
            logo_canvas = tk.Canvas(title_box, width=28, height=28, bg="#121D28", highlightthickness=0)
            logo_canvas.pack(side="left", padx=(0, 10))
            # Left polygon
            logo_canvas.create_polygon(0, 3, 10, 25, 16, 25, 6, 3, fill=COLOR_RED, outline="")
            # Right polygon
            logo_canvas.create_polygon(17, 3, 23, 3, 27, 12, 21, 12, fill=COLOR_RED, outline="")
        except Exception:
            pass

        app_label = ctk.CTkLabel(
            title_box,
            text="VALO.LEVELING",
            font=ctk.CTkFont(family="Segoe UI", size=17, weight="bold"),
            text_color=COLOR_TEXT_PRIMARY
        )
        app_label.pack(side="left")

        sub_label = ctk.CTkLabel(
            title_box,
            text="// 19H ENGINE",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color=COLOR_TEXT_MUTED
        )
        sub_label.pack(side="left", padx=6)

        watermark_badge = ctk.CTkLabel(
            title_box,
            text="[ MO2A // PRIVATE ]",
            font=ctk.CTkFont(family="Consolas", size=11, weight="bold"),
            text_color=COLOR_GREEN,
            fg_color="#0E2822",
            corner_radius=4,
            padx=8,
            pady=2
        )
        watermark_badge.pack(side="left", padx=10)

        # Top Right Actions
        right_box = ctk.CTkFrame(self.header_frame, fg_color="transparent")
        right_box.pack(side="right", padx=20, pady=10)

        # Quick Add Button
        self.btn_add = ctk.CTkButton(
            right_box,
            text="+ ADD ACCOUNT",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            fg_color=COLOR_RED,
            hover_color=COLOR_RED_HOVER,
            height=34,
            command=self.open_add_dialog
        )
        self.btn_add.pack(side="right", padx=(8, 0))

        # Bulk Add Button (Shared Password)
        self.btn_bulk = ctk.CTkButton(
            right_box,
            text="⚡ BULK ADD (SAME PASS)",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            fg_color="#0F382C",
            hover_color="#175240",
            text_color="#00E59B",
            height=34,
            command=self.open_bulk_dialog
        )
        self.btn_bulk.pack(side="right", padx=(8, 0))

        # Delete All Button with confirmation
        self.btn_delete_all = ctk.CTkButton(
            right_box,
            text="🗑 DELETE ALL",
            font=ctk.CTkFont(family="Segoe UI", size=11, weight="bold"),
            fg_color="#2D1217",
            hover_color="#451820",
            text_color="#FF4655",
            border_width=1,
            border_color="#5E202B",
            width=90,
            height=34,
            command=self.delete_all_accounts_dialog
        )
        self.btn_delete_all.pack(side="right", padx=(6, 0))

    def setup_metrics_bar(self):
        """Displays live summary stats: Total, Ready, On Cooldown, Next Unlock."""
        self.metrics_frame = ctk.CTkFrame(self, fg_color="#14202B", height=42, corner_radius=0)
        self.metrics_frame.pack(fill="x", padx=0, pady=0)
        self.metrics_frame.pack_propagate(False)

        inner = ctk.CTkFrame(self.metrics_frame, fg_color="transparent")
        inner.pack(expand=True, fill="both", padx=20)

        self.stat_total = ctk.CTkLabel(inner, text="ACCOUNTS: 0", font=ctk.CTkFont(family="Consolas", size=12, weight="bold"), text_color=COLOR_TEXT_MUTED)
        self.stat_total.pack(side="left", padx=12)

        self.stat_ready = ctk.CTkLabel(inner, text="READY: 0", font=ctk.CTkFont(family="Consolas", size=12, weight="bold"), text_color=COLOR_GREEN)
        self.stat_ready.pack(side="left", padx=12)

        self.stat_cooldown = ctk.CTkLabel(inner, text="COOLDOWN: 0", font=ctk.CTkFont(family="Consolas", size=12, weight="bold"), text_color=COLOR_AMBER)
        self.stat_cooldown.pack(side="left", padx=12)

        self.stat_next = ctk.CTkLabel(inner, text="NEXT READY: --", font=ctk.CTkFont(family="Consolas", size=12), text_color=COLOR_TEXT_PRIMARY)
        self.stat_next.pack(side="right", padx=12)

    def setup_filter_bar(self):
        """Search box and status filter tabs."""
        self.filter_frame = ctk.CTkFrame(self, fg_color="transparent", height=46)
        self.filter_frame.pack(fill="x", padx=20, pady=(12, 6))

        # Search box
        self.search_entry = ctk.CTkEntry(
            self.filter_frame,
            placeholder_text="Filter accounts by name, username, or region...",
            width=320,
            height=34,
            fg_color=COLOR_INPUT_BG,
            border_color=COLOR_CARD_BORDER
        )
        self.search_entry.pack(side="left")
        self.search_entry.bind("<KeyRelease>", self.on_search_change)

        # Status Filter Segmented Button
        self.filter_seg = ctk.CTkSegmentedButton(
            self.filter_frame,
            values=["ALL", "READY", "COOLDOWN"],
            command=self.on_filter_change,
            height=32
        )
        self.filter_seg.set("ALL")
        self.filter_seg.pack(side="right")

    def setup_account_list_view(self):
        """Scrollable container for all account cards."""
        self.scroll_container = ctk.CTkScrollableFrame(
            self,
            fg_color="transparent",
            corner_radius=0
        )
        self.scroll_container.pack(fill="both", expand=True, padx=20, pady=(4, 10))

    def setup_status_footer(self):
        """Subtle bottom status bar with notifications and storage path."""
        self.footer = ctk.CTkFrame(self, fg_color="#0B131A", height=28, corner_radius=0)
        self.footer.pack(fill="x", side="bottom")
        self.footer.pack_propagate(False)

        self.status_msg = ctk.CTkLabel(
            self.footer,
            text="System online. Timers synchronizing dynamically against real-time clock.",
            font=ctk.CTkFont(size=11),
            text_color="#64748B"
        )
        self.status_msg.pack(side="left", padx=16)

        owner_lbl = ctk.CTkLabel(
            self.footer,
            text="MO2A PRIVATE EDITION",
            font=ctk.CTkFont(family="Consolas", size=10, weight="bold"),
            text_color=COLOR_GREEN
        )
        owner_lbl.pack(side="right", padx=16)

        storage_lbl = ctk.CTkLabel(
            self.footer,
            text=f"Storage: {os.path.abspath(DATA_FILE)}",
            font=ctk.CTkFont(family="Consolas", size=10),
            text_color="#475569"
        )
        storage_lbl.pack(side="right", padx=10)

    def refresh_account_list(self):
        """Re-sorts and reconstructs account card widgets based on auto-sorting rules."""
        # Clear existing row cards
        for widget in self.row_widgets:
            widget.destroy()
        self.row_widgets.clear()

        # Get sorted accounts: Ready float to top, followed by cooldown remaining time
        accounts = self.manager.get_sorted_accounts(self.search_query, self.current_filter)

        if not accounts:
            empty_lbl = ctk.CTkLabel(
                self.scroll_container,
                text="No accounts match current filter. Click '+ ADD ACCOUNT' to create one.",
                font=ctk.CTkFont(family="Segoe UI", size=14),
                text_color=COLOR_TEXT_MUTED
            )
            empty_lbl.pack(pady=40)
            self.row_widgets.append(empty_lbl)
        else:
            for acc in accounts:
                row = AccountRowCard(
                    self.scroll_container,
                    account=acc,
                    manager=self.manager,
                    on_action_callback=self.refresh_account_list,
                    notify_status_callback=self.notify_user
                )
                row.pack(fill="x", pady=5)
                self.row_widgets.append(row)

        self.update_metrics()

    def update_metrics(self):
        """Calculates and refreshes top summary numbers."""
        total = len(self.manager.accounts)
        ready_count = 0
        cooldown_count = 0
        soonest_remaining = None

        for acc in self.manager.accounts:
            info = self.manager.get_time_info(acc)
            if info["is_ready"]:
                ready_count += 1
            else:
                cooldown_count += 1
                rem = info["remaining_seconds"]
                if soonest_remaining is None or rem < soonest_remaining:
                    soonest_remaining = rem

        self.stat_total.configure(text=f"ACCOUNTS: {total}")
        self.stat_ready.configure(text=f"READY: {ready_count}")
        self.stat_cooldown.configure(text=f"COOLDOWN: {cooldown_count}")

        if soonest_remaining is not None:
            h = int(soonest_remaining // 3600)
            m = int((soonest_remaining % 3600) // 60)
            s = int(soonest_remaining % 60)
            self.stat_next.configure(text=f"NEXT READY IN: {h:02d}h {m:02d}m {s:02d}s")
        else:
            self.stat_next.configure(text="NEXT READY IN: ALL READY")

    def update_tick_loop(self):
        """
        Executed every 1,000ms via Tkinter root.after.
        Updates card time counters safely without freezing the interface.
        If an account becomes ready, triggers auto-reordering.
        """
        should_reorder = False

        for widget in self.row_widgets:
            if isinstance(widget, AccountRowCard):
                was_ready = widget.account.get("id") in self.last_ready_account_ids
                is_ready = widget.update_display()

                if is_ready and not was_ready and widget.account.get("target_end_time"):
                    # Just transitioned to ready!
                    should_reorder = True
                    self.notify_user(f"Ding! '{widget.account.get('name')}' is now READY for rotation!")

        # Keep track of ready IDs
        self.last_ready_account_ids = {
            acc["id"] for acc in self.manager.accounts if self.manager.get_time_info(acc)["is_ready"]
        }

        self.update_metrics()

        if should_reorder:
            self.refresh_account_list()

        # Schedule next tick in 1 second
        self.after(1000, self.update_tick_loop)

    def on_search_change(self, event=None):
        self.search_query = self.search_entry.get()
        self.refresh_account_list()

    def on_filter_change(self, value):
        self.current_filter = value
        self.refresh_account_list()

    def open_add_dialog(self):
        AccountEditDialog(self, None, self.manager, self.refresh_account_list, self.notify_user)

    def open_bulk_dialog(self):
        BulkAccountDialog(self, self.manager, self.refresh_account_list, self.notify_user)

    def delete_all_accounts_dialog(self):
        """Shows confirmation modal before deleting all accounts."""
        if not self.manager.accounts:
            messagebox.showinfo("No Accounts", "There are no accounts to delete.")
            return

        count = len(self.manager.accounts)
        confirmed = messagebox.askyesno(
            "Confirm Delete All",
            f"Are you sure you want to permanently delete ALL {count} account(s)?\n\nThis will clear all accounts, live timers, and saved levels.\nThis action CANNOT be undone!",
            icon="warning"
        )
        if confirmed:
            self.manager.accounts = []
            self.manager.save_data()
            self.refresh_account_list()
            self.notify_user(f"Permanently deleted all {count} accounts.")
            messagebox.showinfo("Accounts Cleared", "All accounts have been deleted.")

    def notify_user(self, message: str):
        """Updates status bar with latest action."""
        self.status_msg.configure(text=f"[{datetime.now().strftime('%H:%M:%S')}] {message}")


def main():
    # If modern web build exists, launch the modern GPU-accelerated engine (matching the Web Preview 100%)
    dist_dir = os.path.join(get_portable_dir(), "dist")
    is_bundled = hasattr(sys, '_MEIPASS')
    has_web_dist = os.path.isdir(dist_dir) or is_bundled or os.path.isfile(os.path.join(get_portable_dir(), "index.html"))

    if "--legacy" not in sys.argv and has_web_dist:
        try:
            import run_desktop_app
            run_desktop_app.main()
            return
        except Exception as e:
            print(f"[NOTE] Falling back to Tkinter interface: {e}")

    # Fallback to CustomTkinter if explicitly requested via --legacy or web dist is missing
    app = ValorantCooldownApp()
    app.mainloop()


if __name__ == "__main__":
    main()
