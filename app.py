from flask import Flask, render_template, request, redirect, session
import uuid, datetime, sqlite3
from encryptor import encrypt_note, decrypt_note
from utils import init_db
from auth import auth  # 🔐 user login/register blueprint

app = Flask(__name__)
app.secret_key = "supersecretkey"  # ⚠️ Replace with a secure key!
app.register_blueprint(auth)
init_db()

@app.route("/", methods=["GET", "POST"])
def index():
    if "user" not in session:
        return redirect("/login")

    if request.method == "POST":
        note = request.form["note"]
        expiry = int(request.form["expiry"])
        one_time = int(request.form.get("one_time", 0))
        
        encrypted = encrypt_note(note)
        note_id = str(uuid.uuid4())
        now = datetime.datetime.now()
        expires = now + datetime.timedelta(minutes=expiry)

        owner = session["user"]
        shared_with = ""  # 🔜 placeholder for future sharing

        conn = sqlite3.connect("notes.db")
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO notes (id, content, created_at, expires_at, one_time_view, viewed, owner, shared_with)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (note_id, encrypted, now.isoformat(), expires.isoformat(), one_time, 0, owner, shared_with))
        conn.commit()
        conn.close()

        link = request.host_url.rstrip("/") + f"/note/{note_id}"
        return render_template("index.html", link=link)

    return render_template("index.html")


@app.route("/note/<note_id>")
def show_note(note_id):
    if "user" not in session:
        return redirect("/login")

    conn = sqlite3.connect("notes.db")
    cur = conn.cursor()
    cur.execute("SELECT content, expires_at, one_time_view, viewed, shared_with, owner FROM notes WHERE id=?", (note_id,))
    row = cur.fetchone()

    if not row:
        return "Note not found or expired"

    content, expires_at, one_time_view, viewed, shared_with, owner = row

    # Access control
    current_user = session["user"]
    if shared_with and shared_with != current_user and owner != current_user:
        return "❌ You are not authorized to view this note."

    if datetime.datetime.now() > datetime.datetime.fromisoformat(expires_at) or (one_time_view and viewed):
        cur.execute("DELETE FROM notes WHERE id=?", (note_id,))
        conn.commit()
        return "Note expired or already viewed"

    if one_time_view:
        cur.execute("UPDATE notes SET viewed=1 WHERE id=?", (note_id,))
        conn.commit()

    return render_template("view_note.html", note=decrypt_note(content))

@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/login")
    
    username = session["user"]
    
    conn = sqlite3.connect("notes.db")
    cur = conn.cursor()
    
    # Fetch notes created by the user
    cur.execute("SELECT id, expires_at, one_time_view, viewed FROM notes WHERE owner=?", (username,))
    my_notes = cur.fetchall()

    # Fetch notes shared with this user
    cur.execute("SELECT id, expires_at FROM notes WHERE shared_with=? AND owner != ?", (username, username))
    shared_notes = cur.fetchall()

    conn.close()

    return render_template("dashboard.html", my_notes=my_notes, shared_notes=shared_notes, username=username)


if __name__ == "__main__":
    app.run(debug=True)
