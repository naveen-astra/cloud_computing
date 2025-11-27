# Secure Note Vault (Cloud Computing Project)

A cloud-based secure messaging system that allows users to create confidential notes with one-time access and custom expiry. Notes are automatically deleted after viewing or when the expiry time is reached, ensuring privacy, security, and zero long-term data retention.

## Project Overview

Secure Note Vault lets users write confidential text which is encrypted, stored temporarily, and shared through a unique one-time link. The note can only be viewed once, after which it is permanently deleted. This project demonstrates cloud computing concepts, secure data handling, temporary storage, and lightweight backend deployment.

## Key Features

- One-time access secure notes  
- Auto-deletion after first view or expiry  
- Unique and unguessable one-time links  
- Lightweight Flask backend  
- Encrypted secure note content  
- Temporary storage using SQLite  
- Ngrok-based tunneling for public access

## How It Works

1. User submits a confidential note with an optional expiry time.  
2. Backend encrypts the note and stores minimal metadata.  
3. A one-time link is generated and shared.  
4. Recipient opens the link and views the note once.  
5. The note is permanently deleted after viewing or expiry.  
6. No sensitive content stays on the server.

## Installation and Setup

Clone the repository:
git clone https://github.com/naveen-astra/cloud_computing.git
cd cloud_computing

Create and activate virtual environment:
python -m venv venv
venv\Scripts\activate      # Windows
# or
source venv/bin/activate   # Linux/macOS

Install dependencies:
pip install -r requirements.txt

Run the application:
python app.py

(Optional) Start ngrok for external access:
ngrok http 5000

## Project Structure

cloud_computing/
├── app.py
├── auth.py
├── encryptor.py
├── utils.py
├── run.py
├── setup.py
├── templates/
│   ├── index.html
│   ├── create.html
│   └── view.html
└── notes.db

## Technologies Used

- Python  
- Flask  
- SQLite  
- Ngrok (for tunneling)

## Use Cases

- Secure password or OTP sharing  
- Temporary confidential messages  
- One-time sensitive note exchange  
- Cloud computing practical demonstration  



