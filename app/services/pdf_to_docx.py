# app/services/pdf_to_docx.py
from pdf2docx import Converter
from pathlib import Path

def pdf_to_docx(input_pdf_path: str, output_dir: str) -> str:
    in_path = Path(input_pdf_path)
    out_path = Path(output_dir) / (in_path.stem + ".docx")

    # Convert
    cv = Converter(str(in_path))
    try:
        cv.convert(str(out_path))  # you can pass start=0, end=None for page ranges
    finally:
        cv.close()

    return str(out_path)
