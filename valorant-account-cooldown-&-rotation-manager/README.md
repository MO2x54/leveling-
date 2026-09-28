# Valorant Account Cooldown & Rotation Manager (CustomTkinter)

A modern, high-performance dark-themed desktop application built with `CustomTkinter` designed specifically to track and manage the **19-hour daily mission cooldowns and account leveling rotations** for Valorant game accounts.

---

## ⚡ Key Highlights & Specifications

1. **Precision 19-Hour Cooldown Logic**:
   - Compares the account's target unlock timestamp directly against `datetime.now()`.
   - **Zero Desync on Reboot/Sleep**: If your computer goes to sleep or you close the application, the timer calculates accurately upon relaunch without losing seconds.
2. **Auto-Floating & Sorting**:
   - Accounts whose cooldowns have completed automatically float to the top and turn vibrant green (`READY TO PLAY`).
   - Accounts on cooldown remain sorted beneath by remaining time (the account ready soonest appears at the top).
3. **One-Click Quick Login Copy**:
   - Quick-copy buttons for both **Username** and **Password** directly to the system clipboard (with cross-platform support via `pyperclip` and Tkinter fallback).
4. **Persistent Local Storage**:
   - Stores account credentials, regions, notes, and target timestamps safely in `accounts.json` with atomic writing to protect against data corruption.
5. **Non-Blocking Real-Time GUI**:
   - Safe 1-second update loop powered by `root.after()` to guarantee the GUI never lags or freezes.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Python 3.8, 3.9, 3.10, 3.11, 3.12, or 3.13
- Required packages:
  ```bash
  pip install -r requirements.txt
  ```
  *(Or manually: `pip install customtkinter pyperclip`)*

### 2. Launch the Application
Run the desktop app:
```bash
python valorant_cooldown_tracker.py
```
*(On macOS / Linux if Python 3 is aliased: `python3 valorant_cooldown_tracker.py`)*

---

## ⚙️ How the 19-Hour Cooldown Works

In Valorant, daily mission bonuses and XP resets occur 19 hours after the mission set finishes (or standard 24h day cycles offset by 5 hours depending on region). 
When you click **START 19H**:
```python
now = datetime.now()
target = now + timedelta(hours=19)
# Saved in accounts.json as target_end_time in ISO-8601 format
```

When the application displays remaining time:
```python
remaining_seconds = (target_end_time - datetime.now()).total_seconds()
if remaining_seconds <= 0:
    # Account automatically changes to READY TO PLAY
```

---

## 📁 Data Storage Format (`accounts.json`)
The application saves its data locally in `accounts.json`:
```json
[
  {
    "id": "7f9a2b1c-...",
    "name": "Reyna Smurf AP",
    "username": "reyna_ap_01",
    "password": "Password123!",
    "region": "AP",
    "notes": "Ascendant 2 / Daily missions priority",
    "target_end_time": "2026-09-28T05:27:00",
    "cooldown_duration_hours": 19.0,
    "last_started_at": "2026-09-27T10:27:00"
  }
]
```
You can import and export this JSON directly to and from the web companion simulator!
