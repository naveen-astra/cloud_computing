# utils.py
import sqlite3

def init_db():
    conn = sqlite3.connect("notes.db")
    cur = conn.cursor()

    # Notes table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            content BLOB,
            created_at TEXT,
            expires_at TEXT,
            one_time_view INTEGER,
            viewed INTEGER,
            owner TEXT,
            shared_with TEXT
        )
    """)

    # Users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
