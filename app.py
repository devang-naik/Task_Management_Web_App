import sqlite3
from pathlib import Path

from flask import Flask, g, jsonify, request

DB_PATH = Path(__file__).parent / "tasks.db"

# static_folder="." serves index.html / style.css / app.js directly from
# this folder, so the existing frontend files don't need to move.
app = Flask(__name__, static_folder=".", static_url_path="")

FIELDS = ["name", "description", "startDate", "endDate", "assignedTo", "status", "priority", "percent"]


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL DEFAULT '',
            description TEXT NOT NULL DEFAULT '',
            startDate TEXT NOT NULL DEFAULT '',
            endDate TEXT NOT NULL DEFAULT '',
            assignedTo TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT '',
            priority TEXT NOT NULL DEFAULT '',
            percent TEXT NOT NULL DEFAULT ''
        )
        """
    )
    existing_columns = {row["name"] for row in db.execute("PRAGMA table_info(tasks)")}
    if "priority" not in existing_columns:
        db.execute("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT ''")
    db.commit()
    db.close()


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/api/tasks", methods=["GET"])
def list_tasks():
    rows = get_db().execute("SELECT * FROM tasks ORDER BY id DESC").fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json(silent=True) or {}
    values = [str(data.get(field, "") or "") for field in FIELDS]

    db = get_db()
    cursor = db.execute(
        f"INSERT INTO tasks ({', '.join(FIELDS)}) VALUES ({', '.join(['?'] * len(FIELDS))})",
        values,
    )
    db.commit()
    row = db.execute("SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return jsonify(dict(row)), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    data = request.get_json(silent=True) or {}
    db = get_db()
    existing = db.execute("SELECT id FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if existing is None:
        return jsonify({"error": "task not found"}), 404

    updates = [field for field in FIELDS if field in data]
    if updates:
        set_clause = ", ".join(f"{field} = ?" for field in updates)
        values = [str(data.get(field, "") or "") for field in updates]
        db.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?", (*values, task_id))
        db.commit()

    row = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return jsonify(dict(row))


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    db = get_db()
    existing = db.execute("SELECT id FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if existing is None:
        return jsonify({"error": "task not found"}), 404
    db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return "", 204


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", debug=True, port=5000)