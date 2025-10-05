from cryptography.fernet import Fernet
import os
import base64

KEY_FILE = "secret.key"

# Function to load or generate a persistent key
def load_key():
    if not os.path.exists(KEY_FILE):
        key = Fernet.generate_key()
        with open(KEY_FILE, "wb") as f:
            f.write(key)
    else:
        with open(KEY_FILE, "rb") as f:
            key = f.read()
    return key

# Load the key once and create Fernet instance
key = load_key()
cipher = Fernet(key)

def encrypt_note(note):
    encrypted_bytes = cipher.encrypt(note.encode())
    # Convert bytes to base64 string for Supabase compatibility
    return base64.b64encode(encrypted_bytes).decode('utf-8')

def decrypt_note(token):
    # Convert base64 string back to bytes, then decrypt
    encrypted_bytes = base64.b64decode(token.encode('utf-8'))
    return cipher.decrypt(encrypted_bytes).decode()
