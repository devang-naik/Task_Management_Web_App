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

- Python 3.8+
- Flask (`pip install flask`)

### Run it

```bash
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

The database schema is created (and migrated, if needed) automatically on startup — no manual setup required.

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
