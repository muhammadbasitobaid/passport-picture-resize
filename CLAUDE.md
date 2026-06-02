# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Started from the `next-starter` boilerplate, then stripped to a public, no-auth, **single-locale** app and built into a passport-picture resizer. **Removed:** auth (NextAuth), Stripe, the database (Drizzle/Neon), and i18n (next-intl). There are no users, sessions, payments, DB, locales, or middleware. The README is stale boilerplate from the original template; trust this file and the code over it.

The app is a fully client-side image editor: upload a photo → pick a country preset → crop/pan/zoom → adjust brightness/contrast/sharpness → optionally remove & replace the background → export JPEG/PNG/PDF or a print sheet. See `SPECS.md` for the product requirements.

## Commands

```bash
npm run dev            # dev server (Next.js + Turbopack) on :3000
npm run build          # production build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run lint:fix       # eslint --fix
npm run format:check   # prettier check
npm run format:write   # prettier write
npm run test           # jest unit tests
npm run test:watch     # jest watch mode
npm run e2e            # playwright e2e tests
npm run e2e:ui         # playwright with UI
```

Run a single unit test: `npx jest path/to/file.spec.tsx` or `npx jest -t "test name"`.
Run a single e2e test: `npx playwright test path/to/file.spec.ts`.

The CI gate (`.github/workflows/lint.yml`) runs `lint`, `typecheck`, `format:check`, and `test` on PRs to `main`. Run these locally before pushing. Playwright e2e runs in a separate workflow (`.github/workflows/playwright.yml`).

## Architecture

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui ("new-york" style, RSC enabled).

- **The editor** lives in `src/components/editor/`. `editor.tsx` is the client orchestrator holding all state (loaded image, preset, crop, adjustments, removed-background foreground, bg color); the sub-components (`upload-dropzone`, `country-select`, `crop-stage`, `adjustment-controls`, `background-controls`, `export-controls`) are presentational and receive state + callbacks. The page (`src/app/page.tsx`) just renders `<Editor />`.

- **Image pipeline** lives in `src/lib/image/`. Crop offsets are stored in the preset's **output-pixel space** (`types.ts`), so `geometry.ts#computeSourceRect` produces identical framing for both the small preview canvas and the full-size export canvas — `render.ts#renderToCanvas` is shared by both. `buildSourceCanvas` composites the cut-out foreground over the chosen flat color when the background is removed. `adjustments.ts` applies brightness/contrast via the canvas `filter` and sharpen via a 3×3 convolution. `export.ts` handles JPEG/PNG/single-PDF/A4-sheet-PDF/print. Background removal (`background.ts`) lazy-imports `@imgly/background-removal` and runs in-browser (photo never leaves the device).

- **Country presets** are the single source of truth in `src/lib/passport-presets.ts`. Each stores physical mm + DPI; pixel dimensions are derived (`presetPx`) so they can't drift. Adding a country = appending one entry.

- **Single locale (English).** i18n was removed — UI strings are inline in the components, the app has no `[locale]` segment, and there is no `src/middleware.ts`. Don't reintroduce next-intl unless asked.

- **No auth / payments / database.** These were removed. There is no `src/lib/auth.ts`, `src/lib/stripe.ts`, `src/lib/schema.ts`, `src/actions/`, or `src/app/api/` — don't reintroduce them unless the feature genuinely needs a backend. The app is fully static/client-rendered today.

- **Backend, if ever needed, stays in Next.js.** Any server logic (e.g. proxying an external API to hide a key) goes in Route Handlers under `src/app/api/*` or server actions within this app — never a separate service. Keep it minimal and stateless; read secrets via `src/env.mjs`. Image processing is client-first (see `SPECS.md`) so photos stay on-device by default.

- **Theming & UI** — `next-themes` (dark mode via `ThemeProvider`), shadcn/ui components under `src/components/ui/`, icons from `src/components/icons.tsx` (also used by the theme switcher). `cn()` in `src/lib/utils.ts` merges Tailwind classes.

- **Env vars** (`src/env.mjs`) — validated with `@t3-oss/env-nextjs` + Zod. Only two vars remain, both optional: `APP_URL` (metadata base URL, falls back to `http://localhost:3000` in `src/lib/site-config.ts`) and `GOOGLE_SITE_VERIFICATION_ID`. The app runs with no `.env` at all. Add any new env var here AND to `.env.example`; never read `process.env` directly in app code — import `env` from `@/env.mjs`.

## Conventions

- Path alias `@/*` → `src/*`. shadcn aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- Imports are auto-sorted by `eslint-plugin-simple-import-sort` (lint:fix enforces it).
- Husky pre-commit runs lint-staged (eslint --fix + prettier) on staged JS/TS files.
- Commits are linted by commitlint (conventional commits) via `commitlint.config.cjs`.
- Unit tests live in `src/__tests__/unit/` (jsdom, ts-jest); e2e in `src/__tests__/e2e/` (Playwright, baseURL `http://127.0.0.1:3000`). Jest is configured to ignore the e2e directory.

