# Task Tracker

A simple task management web app built for BITS Pilani, Hyderabad Campus. Flask backend, vanilla JavaScript frontend, SQLite storage

## Features

- Create, edit, and delete tasks in an inline-editable table
- Required fields on every task: Task Name, Assigned To, Start Date, End Date, Status, Priority, Completion, Description
- Start/End dates use a native date picker (calendar or typed entry)
- Status dropdown: New, In Progress, Completed, On Hold, Cancelled
- Priority dropdown: High, Moderate, Low — tasks are sorted High → Moderate → Low, with row numbers reassigned accordingly
- Completion percentage shown as a circular progress ring
- Multi-line description field
- Search (by name, description, or assignee) and filter by Status/Priority, applied instantly without a page reload
- Light/dark theme, following your OS preference

## Tech stack

- **Backend:** Python, Flask, SQLite (`app.py`)
- **Frontend:** plain HTML/CSS/JS (`index.html`, `style.css`, `app.js`) — served directly by Flask, no build tooling
- **Storage:** `tasks.db` (SQLite file, created automatically on first run)

## Getting started

### Requirements

- [Git](https://git-scm.com/downloads)
- [Python 3.8+](https://www.python.org/downloads/) (make sure "Add python.exe to PATH" is checked during install on Windows)
- [VS Code](https://code.visualstudio.com/)

### 1. Sign in to GitHub in VS Code

This repo is private, so VS Code needs to be signed in to clone it.

1. Open VS Code.
2. Press `Ctrl+Shift+P` to open the Command Palette.
3. Type **GitHub: Sign in** and select it.
4. A browser window opens — sign in with the GitHub account that has access to this repo, then approve the authorization.

### 2. Clone the repository

1. Press `Ctrl+Shift+P` again.
2. Type **Git: Clone** and select it.
3. Paste the repository URL when prompted:
   ```
   https://github.com/devang-naik/Task_Management_Web_App.git
   ```
4. Choose a parent folder to clone into (e.g. Documents or Desktop) — VS Code creates a `Task_Management_Web_App` folder there.
5. When VS Code asks **"Would you like to open the cloned repository?"**, click **Open**.

> **Don't see "GitHub: Sign in" or "Git: Clone" in the Command Palette?** See [If the options aren't there](#if-the-options-arent-there) below.

### 3. Install dependencies

Open the integrated terminal (`` Ctrl+` ``) and run:

```bash
pip install flask
```

### 4. Run the app

```bash
python app.py
```

### 5. Open it in your browser

Go to **http://127.0.0.1:5000**

The database schema is created (and migrated, if needed) automatically on startup — no manual setup required. To stop the server, press `Ctrl+C` in the terminal.

### If the options aren't there

Some VS Code installs don't show these Command Palette entries (extension disabled, older version, etc.). Two fallbacks:

**No "GitHub: Sign in":**
- Click the account icon in the bottom-left corner of VS Code → **Sign in with GitHub**.
- Or skip signing into VS Code entirely — see the terminal fallback below, which handles sign-in itself.

**No "Git: Clone":**
- Open the Source Control panel (`Ctrl+Shift+G`) — with no folder open, it shows a **Clone Repository** button directly.
- Or use the terminal fallback below.

**Terminal fallback (works regardless of VS Code's UI):**

1. Open a terminal — Command Prompt, PowerShell, or VS Code's own terminal (`` Ctrl+` ``) — in the parent folder you want the project inside.
2. Run:
   ```bash
   git clone https://github.com/devang-naik/Task_Management_Web_App.git
   cd Task_Management_Web_App
   ```
3. Since the repo is private, Git will prompt for authentication the first time — a browser window opens automatically (via Git Credential Manager, bundled with Git for Windows) asking you to sign in to GitHub. Approve it, and the clone continues.
4. Open the folder in VS Code:
   ```bash
   code .
   ```
   (If `code .` doesn't work, open VS Code manually and use `File → Open Folder` on the `Task_Management_Web_App` folder you just cloned.)

## API

All endpoints are under `/api/tasks` and exchange JSON.

| Method | Endpoint            | Description                  |
|--------|---------------------|-------------------------------|
| GET    | `/api/tasks`         | List all tasks                |
| POST   | `/api/tasks`         | Create a task                 |
| PATCH  | `/api/tasks/<id>`     | Update fields on a task       |
| DELETE | `/api/tasks/<id>`     | Delete a task                 |

Each task has: `name`, `description`, `startDate`, `endDate`, `assignedTo`, `status`, `priority`, `percent`.

## Project structure

```
app.py         Flask app + SQLite access
index.html     Page markup
style.css      Styling and theme
app.js         All frontend logic (rendering, editing, search/filter)
tasks.db       SQLite database (created on first run, not committed)
```

---

Created by Devang Navneeth Naik (F2026A7PS0130H) with the help of Claude
