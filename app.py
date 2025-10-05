from flask import Flask, render_template, request, redirect, url_for, jsonify
import uuid
from datetime import datetime, timedelta, timezone
from encryptor import encrypt_note, decrypt_note
from dotenv import load_dotenv
import os
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

# Home page (multi-page SPA - handled by JS)
@app.route("/", methods=["GET"])
def home():
    return render_template("index5.html") 

# Handle note creation
@app.route("/create_note", methods=["POST"])
def create_note():
    try:
        note = request.form["note"]
        expiry = int(request.form["expiry"])  # in minutes
        one_time = int(request.form.get("one_time", 0))

        encrypted = encrypt_note(note)
        note_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires = now + timedelta(minutes=expiry)

        # Insert into Supabase
        data = {
            "id": note_id,
            "content": encrypted,
            "created_at": now.isoformat(),
            "expires_at": expires.isoformat(),
            "one_time_view": one_time,
            "viewed": 0
        }
        
        response = supabase.table("notes").insert(data).execute()

        link = request.host_url.rstrip("/") + url_for("show_note", note_id=note_id)
        
        # Return JSON response for AJAX requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.accept_mimetypes.accept_json:
            return jsonify({"success": True, "link": link, "note_id": note_id})
        
        # Fallback for form submissions
        return render_template("index5.html", link=link)
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error creating note: {error_msg}")  # Log to console
        
        # Return JSON error response for AJAX requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.accept_mimetypes.accept_json:
            return jsonify({
                "success": False, 
                "error": f"Database error: {error_msg}"
            }), 500
        
        # Fallback for form submissions
        return render_template("index5.html", error=error_msg)

# View a note by ID
@app.route("/note/<note_id>")
def show_note(note_id):
    # Fetch note from Supabase
    response = supabase.table("notes").select("*").eq("id", note_id).execute()
    
    if not response.data or len(response.data) == 0:
        return render_template("view_note.html", error="Note not found or has been deleted.")

    row = response.data[0]
    content = row["content"]
    expires_at = row["expires_at"]
    one_time_view = row["one_time_view"]
    viewed = row["viewed"]
    created_at = row["created_at"]
    
    # Check if expired
    expires_dt = datetime.fromisoformat(expires_at)
    now_utc = datetime.now(timezone.utc)
    if now_utc > expires_dt:
        supabase.table("notes").delete().eq("id", note_id).execute()
        return render_template("view_note.html", error="This note has expired and been deleted.")
    
    # Check if already viewed (for one-time view)
    if one_time_view and viewed:
        supabase.table("notes").delete().eq("id", note_id).execute()
        return render_template("view_note.html", error="This note was set for one-time viewing only and has already been viewed.")

    # Mark as viewed if one-time view
    if one_time_view:
        supabase.table("notes").update({"viewed": 1}).eq("id", note_id).execute()
    
    # Decrypt note
    decrypted_note = decrypt_note(content)
    
    # Pass ISO timestamps to template for JavaScript conversion to local time
    return render_template(
        "view_note.html", 
        note=decrypted_note,
        one_time_view=one_time_view,
        created_at_iso=created_at,
        expires_at_iso=expires_at
    )

if __name__ == "__main__":
    app.run(debug=True)
