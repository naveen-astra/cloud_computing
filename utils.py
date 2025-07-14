# utils.py
import sqlite3

def init_db():
    conn = sqlite3.connect("notes.db")  # This creates the database file
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            content BLOB,
            created_at TEXT,
            expires_at TEXT,
            one_time_view INTEGER,
            viewed INTEGER
        )
    """)
    conn.commit()
    conn.close()
