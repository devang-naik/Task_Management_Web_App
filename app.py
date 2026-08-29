import sqlite3
from pathlib import Path

from flask import Flask, g, jsonify, request

DB_PATH = Path(__file__).parent / "tasks.db"

# static_folder="." serves index.html / style.css / app.js directly from
# this folder, so the existing frontend files don't need to move.
app = Flask(__name__, static_folder=".", static_url_path="")

FIELDS = ["name", "description", "startDate", "endDate", "assignedTo", "status", "priority", "percent"]

# This function is used to get the database connection from the Flask application context.
# It checks if a database connection already exists in the `g` object (which is a special object provided by Flask to store data during
# a request). If it doesn't exist, it creates a new connection to the SQLite database specified by `DB_PATH`, sets the row factory to 
#return rows as dictionaries, and stores the connection in `g.db`. Finally, it returns the database connection.
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

#This function is registered as a teardown function for the Flask application context. 
#It is called when the application context is torn down, which happens at the end of each request. 
#The purpose of this function is to close the database connection if it exists.
# It retrieves the database connection from `g.db`, removes it from `g`, and closes it if it was open. This ensures that database connections are properly cleaned up after each request, preventing resource leaks.

@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()

#This function initializes the SQLite database by creating a table named `tasks` if it doesn't already exist.
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