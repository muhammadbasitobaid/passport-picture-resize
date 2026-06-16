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

- **The editor** lives in `src/components/editor/` and uses the "PhotoFlow" design (3-column layout: photo strip · stage+controls · document picker/export). State lives in a **Zustand store** (`store.ts`) — the single source of truth for `photos[]`/`activeId`, `specId`, `crop`, `adjustments`, `bgEnabled`/`bgColor`, `copies`, `busy`, `error`, plus all actions (crop clamping, bg removal, export). `editor.tsx` is now just a layout shell; each panel (`photo-strip`, `stage`, `control-bar`, `document-picker`, `status-banner`) subscribes to only the slices it needs via selectors, so moving a slider re-renders only the panels reading that slice (no prop drilling, no full-tree re-render). The derived composited preview canvas is `useSourceCanvas()` (in `store.ts`), consumed only by `Stage`; `Stage` coalesces canvas draws with `requestAnimationFrame` and applies the expensive sharpen pass only on settle (`renderToCanvas(..., withSharpen)`). **Multi-photo:** several uploads live in the strip; crop/adjustments are global and apply to the active photo, while each photo caches its own removed-background `foreground`. The page (`src/app/page.tsx`) renders `<Editor />` full-screen (no `container`).

- **Design system** is in `src/styles/globals.css`: teal `--primary` + coral accent tokens (light/dark), `--shadow`, `--stage-*` gradient, and the `card-surface` + `font-display` `@utility` helpers. Fonts are Hanken Grotesk (`--font-sans`) and Bricolage Grotesque (`--font-display`) via `src/lib/fonts.ts`. Custom token colors (`coral`, `coral-soft`, `teal-soft`) are exposed to Tailwind through `@theme inline`, so `bg-teal-soft`/`text-coral` work. Theme toggle is in the editor header (next-themes).

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

## Todo conventions

There are TODO-comment conventions in this repo:

1. `todo`/`TODO` (and similar): intended for Claude Code, added by humans.
2. `todo(review)` (or similar): added by Claude Code for human dev review.
3. `todo(pm)`: needs discussion with the project manager or a stakeholder when there is confusion about a flow tied to business logic or a feature — added by Claude Code & devs, for devs.
4. `todo(cleanup)`: added by a human, for a human — a reminder to clean up any static, stale file or dead code.
5. If you encounter any TODO you're not sure of, prompt the dev to clarify in the session.

## JS practices

1. When traversing a list of objects via `map`, `filter`, `reduce`, or similar array HOCs, always destructure the current list item received in the callback param.

## Git & PR workflow

1. There must be no Claude Code trace in the git commit history.
2. When asked to create a PR, always add a proper description.
3. Split work into multiple logical, atomic commits — one coherent change per commit (e.g. a single feature, fix, or refactor) — instead of bundling everything into one big commit. Group related files together, give each commit a clear conventional-commit message, and make sure each commit builds and stands on its own.
4. Before pushing, always verify the build locally (typecheck, lint, and the production build) and make sure it is green. After pushing, confirm the GitHub Actions / CI checks pass (e.g. `gh pr checks` / `gh run watch`) and fix any failures before treating the work as done.

