# Secure Note Vault (Cloud Computing Project)

A cloud-based secure messaging system that allows users to create confidential notes with one-time access and custom expiry. Notes are automatically deleted after viewing or when the expiry time is reached, ensuring privacy, security, and zero long-term data retention.

## Project Overview

Secure Note Vault lets users write confidential text which is encrypted, stored temporarily, and shared through a unique one-time link. The note can only be viewed once, after which it is permanently deleted. This project demonstrates core concepts of cloud computing, secure data handling, temporary storage, and lightweight backend deployment.

## Key Features

- One-time access secure notes
- Auto-deletion after first view or after expiry duration
- Unique unguessable links for each note
- Lightweight Flask backend
- Encrypted note content
- Temporary storage using SQLite
- Ngrok-based public access tunneling (for testing)

## How It Works

1. User writes a confidential note and optionally sets an expiry time.
2. Backend encrypts the content and stores metadata in the database.
3. A unique one-time link is generated and shared.
4. The recipient opens the link and views the note once.
5. After viewing or expiry, the backend deletes the note permanently.
6. No sensitive content remains on the server after deletion.

## Installation and Setup

Clone the repository:
git clone https://github.com/naveen-astra/cloud_computing.git
cd cloud_computing

Create and activate virtual environment:
python -m venv venv
venv\Scripts\activate      # Windows
# OR
source venv/bin/activate   # Linux / macOS

Install dependencies:
pip install -r requirements.txt

Run the application:
python app.py

(Optional) Start ngrok for public access:
ngrok http 5000

## Project Structure

cloud_computing/
├── app.py                # Main Flask backend
├── auth.py               # Authentication logic
├── encryptor.py          # Note encryption and decryption
├── utils.py              # Helper utilities
├── run.py                # Entry point script
├── setup.py              # Setup configuration
├── templates/            # HTML templates for UI
└── notes.db              # SQLite database for metadata

## Technologies Used

- Python
- Flask
- SQLite
- Ngrok (for tunneling/public exposure)

## Use Cases

- Securely sharing passwords or OTPs
- Temporary confidential messages
- One-time sensitive note exchange
- Cloud computing demonstrations




