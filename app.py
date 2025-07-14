from flask import Flask, render_template, request, redirect
import uuid, datetime
from encryptor import encrypt_note, decrypt_note
from utils import init_db
import sqlite3

app = Flask(__name__)
init_db()

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        note = request.form["note"]
        expiry = int(request.form["expiry"])  # in minutes
        one_time = int(request.form.get("one_time", 0))
        
        encrypted = encrypt_note(note)
        note_id = str(uuid.uuid4())
        now = datetime.datetime.now()
        expires = now + datetime.timedelta(minutes=expiry)
        
        conn = sqlite3.connect("notes.db")
        cur = conn.cursor()
        cur.execute("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?)",
                    (note_id, encrypted, now.isoformat(), expires.isoformat(), one_time, 0))
        conn.commit()
        conn.close()
        
        # 👇 Create full URL with host + route
        link = request.host_url.rstrip("/") + f"/note/{note_id}"
        return render_template("index.html", link=link)

    # GET request - show form
    return render_template("index.html")

@app.route("/note/<note_id>")
def show_note(note_id):
    conn = sqlite3.connect("notes.db")
    cur = conn.cursor()
    cur.execute("SELECT content, expires_at, one_time_view, viewed FROM notes WHERE id=?", (note_id,))
    row = cur.fetchone()
    
    if not row:
        return "Note not found or expired"
    
    content, expires_at, one_time_view, viewed = row
    if datetime.datetime.now() > datetime.datetime.fromisoformat(expires_at) or (one_time_view and viewed):
        cur.execute("DELETE FROM notes WHERE id=?", (note_id,))
        conn.commit()
        return "Note expired or already viewed"
    
    if one_time_view:
        cur.execute("UPDATE notes SET viewed=1 WHERE id=?", (note_id,))
        conn.commit()
    
    return render_template("view_note.html", note=decrypt_note(content))

if __name__ == "__main__":
    app.run(debug=True)
