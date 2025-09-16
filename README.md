# Secure Document Conversion Tool

A fast, offline, containerized microservice to securely convert between:

- 📄 **PDF ↔ DOCX**
- 📊 **XLSX → PDF**

Built using **FastAPI**, **LibreOffice**, and packaged with **Docker** for portable cloud-native deployments. 
No third-party APIs or uploads involved.

---

## 🚀 Features

- FastAPI-powered REST API
- Secure file handling with cleanup after response
- API key-based authentication (`X-API-Key`)
- Upload size limits (default: 25MB)
- Structured logging (start, success, failure, duration)
- Ready-to-deploy Docker container
- Health check: `/healthz`

---

## 🛠️ Setup Instructions

### 1. Clone and prepare the project

```bash
git clone https://github.com/your-org/secure-doc-converter.git
cd secure-doc-converter
```

### 2. Build Docker Image

```bash
docker build -t secure-doc-converter .
```

### 3. Run the container

```bash
docker run -d --name sdc -p 8000:8000 \
  -e API_KEY="supersecret123" \
  -e LOG_LEVEL="INFO" \
  -e MAX_UPLOAD_BYTES=26214400 \
  secure-doc-converter
```

> You can now access the API at: http://localhost:8000/docs

---

## 🔐 Authentication

All `/convert/...` routes require an `X-API-Key` header.

### Swagger Usage

- Click **"Authorize"** at the top right
- Enter: `X-API-Key: supersecret123`

### Curl Example

```bash
curl -X POST "http://localhost:8000/convert/docx-to-pdf" \
  -H "X-API-Key: supersecret123" \
  -F "file=@sample.docx" \
  --output result.pdf
```

---

## 📦 Environment Variables

| Variable           | Default              | Description                          |
|--------------------|----------------------|--------------------------------------|
| `API_KEY`          | `dev-key-change-me`  | Required key for all `/convert` API  |
| `MAX_UPLOAD_BYTES` | `26214400` (25MB)    | Max allowed file size                |
| `LOG_LEVEL`        | `INFO`               | Logging level (`DEBUG`, `INFO`, etc) |

---

## 🔁 Supported Endpoints

| Endpoint             | Description              |
|----------------------|--------------------------|
| `/convert/pdf-to-docx` | Convert PDF to DOCX     |
| `/convert/docx-to-pdf` | Convert DOCX to PDF     |
| `/convert/xlsx-to-pdf` | Convert XLSX to PDF     |
| `/healthz`             | Health check (no auth)  |

All file conversions are streamed to disk securely, converted using LibreOffice, and deleted after serving.

---

## ⚠️ Notes

- Default size limit is 25 MB — override using `MAX_UPLOAD_BYTES`.
- Converted files are deleted after serving to avoid disk bloat.
- LibreOffice is bundled inside the container (no system install needed).

---

## 🧪 Development (optional)

```bash
# Set up virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload
```

---

## 📝 License

MIT License © 2025