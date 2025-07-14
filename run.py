import subprocess
import time
import requests
import webbrowser
import os

# Step 1: Start Flask server
subprocess.Popen(["venv\\Scripts\\python.exe", "app.py"])

# Step 2: Wait for Flask to start
time.sleep(3)

# Step 3: Start ngrok tunnel to port 5000
ngrok_process = subprocess.Popen(["ngrok.exe", "http", "5000"])
time.sleep(5)  # Let ngrok boot up

# Step 4: Fetch the public URL from ngrok API
try:
    res = requests.get("http://127.0.0.1:4040/api/tunnels")
    public_url = res.json()["tunnels"][0]["public_url"]
except Exception as e:
    print("Failed to get ngrok URL:", e)
    public_url = "http://localhost:5000"

# Step 5: Open browser
print("Opening:", public_url)
webbrowser.open(public_url)

# Optional: copy to clipboard (Windows only)
try:
    os.system(f'echo {public_url} | clip')
except:
    pass
