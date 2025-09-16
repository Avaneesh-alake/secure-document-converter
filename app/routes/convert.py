# app/routes/convert.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import os

import time
from app.utils.logger import logger
from fastapi import BackgroundTasks
from app.services.pdf_to_docx import pdf_to_docx
from app.services.docx_to_pdf import docx_to_pdf
from app.services.xlsx_to_pdf import xlsx_to_pdf
from app.utils.file_handler import save_upload, cleanup, io_dirs
from app.utils.file_handler import save_upload_capped
from starlette.status import HTTP_413_REQUEST_ENTITY_TOO_LARGE
from app.utils.file_handler import save_upload, cleanup, io_dirs, send_file_with_cleanup

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    upload_path = save_upload(file.file, file.filename)
    return {"message": "File uploaded", "filename": Path(upload_path).name}

@router.post("/pdf-to-docx")
async def convert_pdf_to_docx(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a .pdf file")

    t0 = time.perf_counter()
    logger.info(f"START pdf->docx filename={file.filename}")

    upload_dir, output_dir = io_dirs()
    try:
        src_path = save_upload_capped(file.file, file.filename)
    except ValueError as ve:
        logger.warning(f"REJECT pdf->docx too_large filename={file.filename} err={ve}")
        raise HTTPException(status_code=HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(ve))

    try:
        out_path = pdf_to_docx(src_path, output_dir)
        cleanup(src_path)
        dt = time.perf_counter() - t0
        logger.info(f"OK pdf->docx filename={file.filename} out={out_path} time_sec={dt:.3f}")

        return send_file_with_cleanup(
            path=out_path,
            filename=Path(out_path).name,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            background_tasks=background_tasks
        )
    except Exception as e:
        cleanup(src_path)
        dt = time.perf_counter() - t0
        logger.error(f"FAIL pdf->docx filename={file.filename} error={e} time_sec={dt:.3f}")
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")


@router.post("/docx-to-pdf")
async def convert_docx_to_pdf(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Please upload a .docx file")

    t0 = time.perf_counter()
    logger.info(f"START docx->pdf filename={file.filename}")

    upload_dir, output_dir = io_dirs()
    try:
        src_path = save_upload_capped(file.file, file.filename)
    except ValueError as ve:
        logger.warning(f"REJECT docx->pdf too_large filename={file.filename} err={ve}")
        raise HTTPException(status_code=HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(ve))

    try:
        out_path = docx_to_pdf(src_path, output_dir)
        cleanup(src_path)
        dt = time.perf_counter() - t0
        logger.info(f"OK docx->pdf filename={file.filename} out={out_path} time_sec={dt:.3f}")

        return send_file_with_cleanup(
            path=out_path,
            filename=Path(out_path).name,
            media_type="application/pdf",
            background_tasks=background_tasks
        )
    except Exception as e:
        cleanup(src_path)
        dt = time.perf_counter() - t0
        logger.error(f"FAIL docx->pdf filename={file.filename} error={e} time_sec={dt:.3f}")
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")


@router.post("/xlsx-to-pdf")
async def convert_xlsx_to_pdf(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    if not file.filename.lower().endswith((".xls", ".xlsx")):
        raise HTTPException(status_code=400, detail="Please upload an Excel file (.xls or .xlsx)")

    t0 = time.perf_counter()
    logger.info(f"START xlsx->pdf filename={file.filename}")

    upload_dir, output_dir = io_dirs()
    try:
        src_path = save_upload_capped(file.file, file.filename)
    except ValueError as ve:
        logger.warning(f"REJECT xlsx->pdf too_large filename={file.filename} err={ve}")
        raise HTTPException(status_code=HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(ve))

    try:
        out_path = xlsx_to_pdf(src_path, output_dir)
        cleanup(src_path)
        dt = time.perf_counter() - t0
        logger.info(f"OK xlsx->pdf filename={file.filename} out={out_path} time_sec={dt:.3f}")

        return send_file_with_cleanup(
            path=out_path,
            filename=Path(out_path).name,
            media_type="application/pdf",
            background_tasks=background_tasks
        )
    except Exception as e:
        cleanup(src_path)
        dt = time.perf_counter() - t0
        logger.error(f"FAIL xlsx->pdf filename={file.filename} error={e} time_sec={dt:.3f}")
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")
