"""FastAPI background-removal microservice (BiRefNet-lite, CPU).

Endpoints:
  GET  /health   -> liveness + whether the model is loaded
  POST /remove   -> multipart "file" upload, returns an RGBA PNG cut-out

Configuration via env vars (see .env.example):
  BG_MODEL           rembg model name (default: birefnet-general-lite)
  MAX_UPLOAD_BYTES   reject larger uploads (default: 15 MiB)
  ALLOWED_ORIGINS    comma-separated CORS origins (default: *)
"""

from __future__ import annotations

import io
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from rembg import new_session, remove

MODEL_NAME = os.environ.get("BG_MODEL", "birefnet-general-lite")
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", str(15 * 1024 * 1024)))
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",") if o.strip()
]

_session = None


def get_session():
    global _session
    if _session is None:
        _session = new_session(MODEL_NAME)
    return _session


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm the model at startup so the first request isn't slow (first load also
    # downloads the weights to ~/.u2net). Don't crash startup if it fails.
    try:
        get_session()
        print(f"[startup] model loaded: {MODEL_NAME}")
    except Exception as e:  # noqa: BLE001
        print(f"[startup] model not preloaded: {e}")
    yield


app = FastAPI(title="Background Removal Service", version="0.3.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_NAME, "loaded": _session is not None}


@app.post("/remove")
async def remove_bg(file: UploadFile = File(...)) -> Response:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty upload")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large")

    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Invalid or unsupported image")

    t0 = time.time()
    try:
        cut = remove(img.convert("RGB"), session=get_session()).convert("RGBA")
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    buf = io.BytesIO()
    cut.save(buf, format="PNG")
    elapsed_ms = int((time.time() - t0) * 1000)

    return Response(
        content=buf.getvalue(),
        media_type="image/png",
        headers={"X-Inference-Ms": str(elapsed_ms)},
    )
