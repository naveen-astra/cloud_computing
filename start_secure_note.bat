@echo off
title Secure Note Vault - Flask + ngrok

:: Activate virtual environment
call venv\Scripts\activate

:: Start Flask app in a new terminal
start cmd /k "python app.py"

:: Wait 3 seconds to ensure Flask is running
timeout /t 3 > nul

:: Start ngrok on port 5000 in another terminal
start cmd /k "ngrok http 5000"
