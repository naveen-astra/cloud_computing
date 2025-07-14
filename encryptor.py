# encryptor.py
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)

def encrypt_note(note):
    return cipher.encrypt(note.encode())

def decrypt_note(token):
    return cipher.decrypt(token).decode()
