# app/main.py
from fastapi import FastAPI, Depends
from app.routes import convert
from app.auth import verify_api_key
from fastapi.middleware.cors import CORSMiddleware
from app.routes.convert import router as convert_router

app = FastAPI(
    title="Secure Document Conversion Tool",
    version="1.0.0",
    description="Convert DOCX ↔ PDF, XLSX → PDF securely"
)

# Apply auth to the whole router:
app.include_router(
    convert.router,
    prefix="/convert",
    dependencies=[Depends(verify_api_key)]
)

# public health endpoint (no auth) 
@app.get("/healthz")
def healthz():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)