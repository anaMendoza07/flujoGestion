import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "agentemotor.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS clients (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name   TEXT NOT NULL,
            phone       TEXT,
            email       TEXT,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS policies (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id       INTEGER NOT NULL REFERENCES clients(id),
            policy_type     TEXT NOT NULL,
            insurer         TEXT NOT NULL,
            expiration_date TEXT NOT NULL,
            status          TEXT NOT NULL DEFAULT 'active',
            priority_level  TEXT NOT NULL DEFAULT 'low',
            premium_amount  REAL,
            created_at      TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS policy_activities (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            policy_id     INTEGER NOT NULL REFERENCES policies(id),
            activity_type TEXT NOT NULL,
            note          TEXT,
            created_at    TEXT NOT NULL DEFAULT (datetime('now'))
        );
    """)

    conn.commit()
    conn.close()