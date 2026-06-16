# Passport Picture Resizer

A fully client-side web app that turns an ordinary photo into a compliant
passport / ID photo: **upload → pick a country preset → crop / pan / zoom →
adjust brightness / contrast / saturation / sharpness → optionally remove &
replace the background → export JPEG / PNG / PDF or a print sheet.**

This repository contains **two instances**:

| Instance | Path | Stack | Purpose |
|---|---|---|---|
| **Web app** | repo root | Next.js 15 · React 19 · TypeScript · Tailwind 4 · shadcn/ui | The editor UI and image pipeline (runs in the browser) |
| **Background-removal service** | `services/bg-removal` | Python · FastAPI · rembg (BiRefNet-lite) | CPU model that produces the cut-out for the "Remove background" feature |

The web app talks to the service through the Next.js route handler at
`src/app/api/remove-bg/route.ts`. Everything else in the editor (crop, adjust,
export) is pure client-side and works without the service.

> There is **no auth, database, payments, or i18n** — these were removed from
> the original starter template. See `CLAUDE.md` for the authoritative
> architecture notes.

---

## Prerequisites

- **Node.js 18.18+** (or 20+) and **npm** — for the web app.
- **Python 3.10+** — only for the background-removal service (or use Docker).
- **Docker** — optional, an alternative way to run the service.

---

## 1. Web app setup (repo root)

```bash
# 1. Install dependencies
npm install

# 2. (optional) Create a local .env — every variable is optional
cp .env.example .env

# 3. Run the dev server (Turbopack) on http://localhost:5173
npm run dev
```

Open **http://localhost:5173**. The editor is fully usable immediately; only the
**Remove background** toggle requires the service below to be running.

### Environment variables

All optional, validated in `src/env.mjs` (`@t3-oss/env-nextjs` + Zod). The app
runs with no `.env` at all.

| Variable | Default | Purpose |
|---|---|---|
| `APP_URL` | `http://localhost:3000` | Metadata base URL & sitemap |
| `GOOGLE_SITE_VERIFICATION_ID` | – | Google Search Console (optional) |
| `BG_REMOVAL_URL` | `http://localhost:7001` | Base URL of the background-removal service |

> Never read `process.env` directly in app code — import `env` from `@/env.mjs`,
> and add any new variable to **both** `src/env.mjs` and `.env.example`.

---

## 2. Background-removal service setup (`services/bg-removal`)

Required for the "Remove background" feature. Full details in
[`services/bg-removal/README.md`](services/bg-removal/README.md).

```bash
cd services/bg-removal

# Option A — local Python (recommended for dev)
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python download_model.py          # downloads the BiRefNet-lite model (~214 MB)
uvicorn app.main:app --reload --port 7001

# Option B — Docker (model is baked into the image)
docker build -t bg-removal .
docker run --rm -p 7001:7001 bg-removal
```

The service listens on **http://localhost:7001** (`GET /health`,
`POST /remove`). The web app's `BG_REMOVAL_URL` should point at it.

### Running both together (typical dev loop)

```bash
# terminal 1 — background-removal service
cd services/bg-removal && source .venv/bin/activate && uvicorn app.main:app --port 7001

# terminal 2 — web app
npm run dev
```

---

## Scripts (web app)

| Script | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) on `:5173` |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format:check` / `format:write` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` / `test:watch` | Jest unit tests |
| `npm run e2e` / `e2e:ui` | Playwright e2e tests |

CI (`.github/workflows/lint.yml`) runs lint, typecheck, format:check and test on
PRs to `main`; Playwright runs in a separate workflow.

---

## Project structure

```bash
.
├── .github/workflows         # CI: lint/typecheck/format/test + playwright
├── docs                      # estimation / planning docs
├── public                    # static assets
├── services
│   └── bg-removal            # BiRefNet-lite background-removal microservice (Python)
├── src
│   ├── __tests__             # unit (jsdom) + e2e (playwright)
│   ├── app                   # App Router: page, layout, api/remove-bg
│   ├── components            # editor/ (UI) + ui/ (shadcn)
│   ├── lib                   # image pipeline, passport presets, utils
│   ├── styles                # globals.css (design tokens)
│   └── env.mjs               # env validation
├── estimate.md               # project quote
└── CLAUDE.md                 # architecture notes (source of truth)
```
