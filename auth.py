from flask import Blueprint, render_template, request, redirect, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

auth = Blueprint("auth", __name__)

@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("notes.db")
        cur = conn.cursor()
        cur.execute("SELECT password FROM users WHERE username=?", (username,))
        row = cur.fetchone()
        conn.close()

        if row and check_password_hash(row[0], password):
            session["user"] = username
            return redirect("/dashboard")
        else:
            flash("Invalid credentials", "error")
    return render_template("login.html")

@auth.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        hashed = generate_password_hash(password)

        try:
            conn = sqlite3.connect("notes.db")
            cur = conn.cursor()
            cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed))
            conn.commit()
            conn.close()
            flash("Account created!", "success")
            return redirect("/login")
        except sqlite3.IntegrityError:
            flash("Username already exists", "error")

    return render_template("register.html")

@auth.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/login")
