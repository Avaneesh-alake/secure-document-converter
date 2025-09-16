# app/services/xlsx_to_pdf.py
import subprocess
from pathlib import Path

def xlsx_to_pdf(input_xlsx_path: str, output_dir: str) -> str:
    in_path = Path(input_xlsx_path)
    out_path = Path(output_dir) / (in_path.stem + ".pdf")

    # Use LibreOffice to convert
    cmd = [
        "libreoffice",
        "--headless",
        "--convert-to", "pdf",
        "--outdir", str(output_dir),
        str(in_path)
    ]

    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(f"LibreOffice conversion failed: {result.stderr.decode()}")

    return str(out_path)
