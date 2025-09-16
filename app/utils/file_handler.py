# app/utils/file_handler.py
import os
import shutil
from pathlib import Path
from typing import Tuple
from fastapi import BackgroundTasks
from app.config import MAX_UPLOAD_BYTES
from fastapi.responses import FileResponse

UPLOAD_DIR = Path("temp_uploads")
OUTPUT_DIR = Path("temp_outputs")

for d in (UPLOAD_DIR, OUTPUT_DIR):
    d.mkdir(parents=True, exist_ok=True)

def save_upload(file_obj, filename: str) -> str:
    """Save an UploadFile-like object to disk and return the full path."""
    dest = UPLOAD_DIR / filename
    with open(dest, "wb") as f:
        shutil.copyfileobj(file_obj, f)
    return str(dest)

def cleanup(*paths: str) -> None:
    for p in paths:
        try:
            os.remove(p)
        except Exception:
            pass

def io_dirs() -> Tuple[str, str]:
    return str(UPLOAD_DIR), str(OUTPUT_DIR)

def send_file_with_cleanup(path: str, filename: str, media_type: str, background_tasks: BackgroundTasks):
    """Return a file and delete it from disk after the response is sent."""
    def _remove():
        try:
            os.remove(path)
        except Exception:
            pass
    background_tasks.add_task(_remove)
    return FileResponse(path=path, filename=filename, media_type=media_type)

def save_upload_capped(file_obj, filename: str, max_bytes: int = MAX_UPLOAD_BYTES) -> str:
    """
    Stream-save an upload to disk with a hard size cap.
    Raises ValueError if the file exceeds max_bytes.
    """
    dest = UPLOAD_DIR / filename
    written = 0
    chunk_size = 1024 * 1024  # 1 MB

    with open(dest, "wb") as f:
        while True:
            chunk = file_obj.read(chunk_size)
            if not chunk:
                break
            written += len(chunk)
            if written > max_bytes:
                # Clean partial file then error
                try: os.remove(dest)
                except Exception: pass
                raise ValueError(f"File too large (> {max_bytes} bytes)")
            f.write(chunk)
    return str(dest)

