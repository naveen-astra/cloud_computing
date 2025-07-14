@echo off
title 🧠 Secure Note Vault - One Click Launch
cd /d %~dp0
echo Starting Secure Note Vault...
setlocal enabledelayedexpansion

:: Activate virtual environment
call venv\Scripts\activate

:: Start Flask server in a new terminal
start "" cmd /k "python app.py"

:: Wait for Flask to fully start
timeout /t 4 > nul

:: Start ngrok and write output to temp file
start "" /min cmd /c "ngrok http 5000 > ngrok_output.txt"

:: Wait for ngrok to initialize and write URL
timeout /t 6 > nul

:: Read the ngrok public URL from the output file
for /f "tokens=1,2 delims= " %%A in ('
