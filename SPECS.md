# Passport Picture Resizer — Requirements

## Overview

A browser-based tool that turns an ordinary photo into a compliant passport/ID
photo. The user uploads a picture, picks a target country (which sets the exact
output dimensions), adjusts the image, optionally swaps the background, and
exports a print-ready file.

The app is **client-first**: image processing should run in the browser so
uploaded photos stay on the user's device by default (a privacy guarantee). It
currently has no auth, account, or standalone backend (see `CLAUDE.md`).

**If a backend becomes necessary** (e.g. proxying a background-removal API to
keep a secret key server-side), it is implemented **inside this Next.js app** —
Route Handlers under `src/app/api/*` and/or server actions — never as a separate
service. Keep any such surface minimal and stateless; do not reintroduce a
database or auth unless a requirement genuinely demands it.

## Goals

- Produce output that meets a selected country's passport-photo dimension and
  resolution rules.
- Work entirely offline / in-browser; no image is uploaded to a server.
- Be usable on a phone (most users will photograph themselves on a phone).

## Non-goals (for now)

- Biometric compliance validation (face angle, eyes-open, neutral expression,
  shadow detection). We resize and crop; we do not certify acceptance.
- User accounts, saved projects, or cloud storage.
- Batch processing of multiple photos at once.

---

## Functional requirements

### 1. Image upload

- Accept a user-supplied photo via file picker **and** drag-and-drop.
- Supported input formats: **JPEG and PNG** (the original spec said "any
  captured jpeg"; PNG is cheap to add and common from screenshots/phones).
- Reject unsupported types and oversized files with a clear inline message.
  Proposed cap: **15 MB** (revisit after testing typical phone photos).
- Show a preview immediately after a valid upload.
- Warn (do not block) if the uploaded image's resolution is too low to satisfy
  the selected country's required pixel dimensions at print quality.

**Acceptance:** Given a 12 MP JPEG, when the user drops it onto the upload area,
the preview renders and the editing tools become enabled.

### 2. Country presets & resizing

- Maintain a config of country presets. Each preset defines:
  - country name + ISO code,
  - physical size (e.g. 35×45 mm, or 2×2 in for the US),
  - required output resolution in pixels (derived from size × target DPI),
  - target DPI (e.g. 300),
  - optional head-size / positioning guidance (% of frame the face should fill).
- Presets live in a single typed source file (e.g.
  `src/lib/passport-presets.ts`) so adding a country is a one-line data change.
- When the user selects a country, the crop/output frame updates to that
  aspect ratio and the image is scaled/cropped to produce exactly the required
  pixel dimensions on export.
- Provide a crop/reposition control (pan + zoom) with a face-position guide
  overlay so the user can align the head within the frame.
- Ship a sensible default selection on first load (e.g. detect locale, else US
  or a generic 35×45).

**Acceptance:** Selecting "Germany (35×45 mm @ 300 DPI)" yields an export of
413×531 px (±1 px) regardless of the source image size.

### 3. Basic image adjustments

- Provide non-destructive sliders for **brightness, contrast, and sharpness**.
- Each slider has a neutral default and a visible reset; a global "reset all"
  restores the original.
- Adjustments preview in real time on a downscaled canvas, then apply at full
  resolution on export.

**Acceptance:** Moving the brightness slider updates the preview within ~100 ms;
resetting returns the preview to the original pixels.

### 4. Background removal & replacement

- Let the user remove the photo background and replace it with a flat color.
- Offer a palette of common passport background colors (white, off-white,
  light blue, light grey) plus a custom color picker.
- **Open decision — background-removal approach:**
  - **Client-side ML** (e.g. a WASM/ONNX segmentation model bundled in the app)
    keeps the privacy/offline guarantee but adds bundle size and CPU cost.
  - **Third-party API** is higher quality but breaks the "no image leaves the
    device" promise. If chosen, the call is proxied through a Next.js Route
    Handler (`src/app/api/remove-background/route.ts`) so the API key stays
    server-side; the route forwards the image and returns the result without
    persisting it.
  - Default recommendation: client-side, to preserve the privacy guarantee.
- Show a processing indicator; removal is the slowest step.
- Allow toggling the replaced background on/off to compare.

**Acceptance:** After removal, choosing "white" composites the cut-out subject
over a solid white background with clean edges around hair/shoulders.

### 5. Export & print

- Export the final framed image as:
  - **JPEG/PNG** at the selected country's exact pixel dimensions and DPI, and
  - **PDF** sized to the physical dimensions (so it prints at true size).
- PDF export should support a **print sheet** layout option: tile multiple
  copies (e.g. a 4×6 in / A4 sheet of identical photos) to save on prints.
- Provide a direct **Print** action (browser print dialog) for the sheet.
- Exported filename encodes country + dimensions, e.g.
  `passport_DE_35x45.jpg`.

**Acceptance:** Exporting to PDF for a US preset produces a document whose
photos measure 2×2 in when printed at 100% scale.

---

## Cross-cutting requirements

- **Privacy:** no photo or derived data is transmitted off-device (contingent
  on the req-4 background-removal decision). If a Next.js Route Handler must
  touch an image, it processes in-request and persists nothing.
- **Backend, if any, is Next.js:** Route Handlers / server actions within this
  app — no separate service, and any secrets are read via `src/env.mjs`.
- **Responsive & touch-friendly:** the crop, sliders, and color picker must work
  with touch on mobile.
- **i18n:** all user-facing strings go through `next-intl` message files
  (`messages/{locale}.json`), matching the existing setup.
- **Performance:** full-resolution processing happens off the main thread (Web
  Worker / OffscreenCanvas) so the UI stays responsive on large photos.
- **Accessibility:** controls are keyboard-operable and labeled.

## Open questions

1. Background removal: bundled client-side model vs. external API? (privacy
   trade-off above)
2. Which countries ship in v1? (Suggest a starter set: US, UK, EU/Schengen 35×45,
   India, Canada, Australia.)
3. Is biometric/face-position auto-validation in scope later, or strictly manual?
4. Source-of-truth for preset dimensions — which official reference do we cite
   per country to avoid drift?
