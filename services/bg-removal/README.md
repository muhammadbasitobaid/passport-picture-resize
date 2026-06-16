# Background Removal Service (BiRefNet-lite, CPU)

A small **FastAPI + rembg** microservice that removes the background from a
portrait using **BiRefNet (lite backbone, ~214 MB)** for sharp hair/edge detail.
CPU-only. It returns an RGBA PNG cut-out; the web app composites it over the
chosen flat background color.

This service powers the **Remove background** feature of the
[Passport Picture Resizer](../../README.md) web app, reached via the Next.js
route handler `src/app/api/remove-bg/route.ts`.

---

## Prerequisites

- **Python 3.10+** and `pip` (for the local route), **or**
- **Docker** (for the containerized route).
- Network access on first run to download the model (~214 MB) into the rembg
  cache (`~/.u2net`).

---

## Setup — local Python (recommended for dev)

```bash
cd services/bg-removal

# 1. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (optional) Configure environment variables
cp .env.example .env                 # all values have sensible defaults

# 4. Pre-download the model weights (~214 MB) so the first request is fast
python download_model.py

# 5. Run the service on http://localhost:7001
uvicorn app.main:app --reload --port 7001
```

## Setup — Docker

The model is baked into the image at build time, so the container is
self-contained (no runtime download).

```bash
cd services/bg-removal
docker build -t bg-removal .
docker run --rm -p 7001:7001 bg-removal
```

---

## Environment variables

Copy `.env.example` to `.env` (all are optional — defaults shown):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `7001` | Port the service listens on |
| `BG_MODEL` | `birefnet-general-lite` | rembg model name |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS origins (e.g. `http://localhost:5173`) |
| `MAX_UPLOAD_BYTES` | `15728640` (15 MiB) | Reject larger uploads |

---

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness + which model is loaded |
| `POST` | `/remove` | multipart form field `file` (image) → RGBA PNG cut-out |

The `/remove` response includes an `X-Inference-Ms` header with model time.

```bash
# Smoke test
curl -s http://localhost:7001/health
curl -s -X POST -F "file=@/path/to/photo.jpg" http://localhost:7001/remove -o cutout.png
```

---

## Notes

- **License:** BiRefNet weights are MIT (commercial-safe).
- **Performance:** ~several seconds per image on CPU (BiRefNet is heavier than a
  lightweight matting model — the trade for sharper edges). Use a GPU host or a
  managed API if you need lower latency at scale.
- **Deployment (later):** any container host — Railway / Render / Fly.io. Point
  the web app's `BG_REMOVAL_URL` at the deployed URL.
