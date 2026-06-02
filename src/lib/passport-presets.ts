/**
 * Country passport/ID photo presets.
 *
 * Adding a country is a one-line data change: append an entry below. Pixel
 * dimensions are derived from the physical size at the target DPI so the data
 * stays in one place and can't drift (see `presetPx`).
 *
 * Dimension references are the commonly published official requirements; verify
 * against the issuing authority before relying on them for a real application.
 */

export type PassportPreset = {
  /** Stable id used in URLs / filenames, e.g. "de". */
  id: string;
  /** ISO 3166-1 alpha-2 code, used in the exported filename. */
  countryCode: string;
  /** Human-readable label (proper noun — intentionally not translated). */
  name: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
  /**
   * Head height (crown to chin) as a fraction of the photo height, [min, max].
   * Drives the face-position guide overlay. Falls back to a generic range.
   */
  headHeightPct?: [number, number];
};

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: "us",
    countryCode: "US",
    name: "United States (2×2 in)",
    widthMm: 50.8,
    heightMm: 50.8,
    dpi: 300,
    headHeightPct: [0.5, 0.69],
  },
  {
    id: "eu",
    countryCode: "EU",
    name: "EU / Schengen (35×45 mm)",
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    headHeightPct: [0.7, 0.8],
  },
  {
    id: "gb",
    countryCode: "GB",
    name: "United Kingdom (35×45 mm)",
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    headHeightPct: [0.64, 0.76],
  },
  {
    id: "in",
    countryCode: "IN",
    name: "India (35×45 mm)",
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    headHeightPct: [0.62, 0.74],
  },
  {
    id: "ca",
    countryCode: "CA",
    name: "Canada (50×70 mm)",
    widthMm: 50,
    heightMm: 70,
    dpi: 300,
    headHeightPct: [0.44, 0.51],
  },
  {
    id: "au",
    countryCode: "AU",
    name: "Australia (35×45 mm)",
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    headHeightPct: [0.66, 0.78],
  },
  {
    id: "cn",
    countryCode: "CN",
    name: "China (33×48 mm)",
    widthMm: 33,
    heightMm: 48,
    dpi: 300,
    headHeightPct: [0.62, 0.74],
  },
];

export const DEFAULT_PRESET_ID = "us";

const mmToPx = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

/** Exact output pixel dimensions for a preset. */
export const presetPx = (preset: PassportPreset) => ({
  width: mmToPx(preset.widthMm, preset.dpi),
  height: mmToPx(preset.heightMm, preset.dpi),
});

export const presetAspect = (preset: PassportPreset) =>
  preset.widthMm / preset.heightMm;

export const getPreset = (id: string): PassportPreset =>
  PASSPORT_PRESETS.find((p) => p.id === id) ??
  PASSPORT_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)!;
