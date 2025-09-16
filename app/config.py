# app/config.py
import os

API_KEY = os.getenv("API_KEY", "dev-key-change-me")  # override in prod

# Max upload size in bytes (default 25 MB)
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))