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

export const DPI = 300;

export type PassportPreset = {
  /** Stable id used in URLs / filenames. */
  id: string;
  /** ISO 3166-1 alpha-2 (or region) code, used in the exported filename. */
  countryCode: string;
  /** Emoji flag shown in the document picker. */
  flag: string;
  /** Human-readable label (proper noun — intentionally not translated). */
  name: string;
  widthMm: number;
  heightMm: number;
  /** Head height (crown to chin) requirement, in millimetres. */
  headMinMm: number;
  headMaxMm: number;
};

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: "us-pass",
    countryCode: "US",
    flag: "🇺🇸",
    name: "US Passport",
    widthMm: 51,
    heightMm: 51,
    headMinMm: 25,
    headMaxMm: 35,
  },
  {
    id: "uk",
    countryCode: "GB",
    flag: "🇬🇧",
    name: "UK Passport",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 29,
    headMaxMm: 34,
  },
  {
    id: "cdn-pass",
    countryCode: "CA",
    flag: "🇨🇦",
    name: "Canada Passport",
    widthMm: 50,
    heightMm: 70,
    headMinMm: 31,
    headMaxMm: 36,
  },
  {
    id: "schengen",
    countryCode: "EU",
    flag: "🇪🇺",
    name: "Schengen / Italy",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 32,
    headMaxMm: 36,
  },
  {
    id: "ireland",
    countryCode: "IE",
    flag: "🇮🇪",
    name: "Ireland",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 30,
    headMaxMm: 36,
  },
  {
    id: "india",
    countryCode: "IN",
    flag: "🇮🇳",
    name: "India / OCI",
    widthMm: 51,
    heightMm: 51,
    headMinMm: 25,
    headMaxMm: 35,
  },
  {
    id: "china",
    countryCode: "CN",
    flag: "🇨🇳",
    name: "China Visa",
    widthMm: 33,
    heightMm: 48,
    headMinMm: 28,
    headMaxMm: 33,
  },
  {
    id: "hk",
    countryCode: "HK",
    flag: "🇭🇰",
    name: "Hong Kong",
    widthMm: 40,
    heightMm: 50,
    headMinMm: 28,
    headMaxMm: 33,
  },
  {
    id: "uae",
    countryCode: "AE",
    flag: "🇦🇪",
    name: "UAE Visa",
    widthMm: 43,
    heightMm: 55,
    headMinMm: 28,
    headMaxMm: 38,
  },
  {
    id: "malaysia",
    countryCode: "MY",
    flag: "🇲🇾",
    name: "Malaysia",
    widthMm: 35,
    heightMm: 50,
    headMinMm: 25,
    headMaxMm: 35,
  },
];

export const DEFAULT_PRESET_ID = "us-pass";

const mmToPx = (mm: number, dpi = DPI) => Math.round((mm / 25.4) * dpi);

/** Exact output pixel dimensions for a preset. */
export const presetPx = (preset: PassportPreset) => ({
  width: mmToPx(preset.widthMm),
  height: mmToPx(preset.heightMm),
});

export const presetAspect = (preset: PassportPreset) =>
  preset.widthMm / preset.heightMm;

/** Average head height as a fraction of the photo height (for guide overlays). */
export const headFraction = (preset: PassportPreset) =>
  (preset.headMinMm + preset.headMaxMm) / 2 / preset.heightMm;

export const getPreset = (id: string): PassportPreset =>
  PASSPORT_PRESETS.find((p) => p.id === id) ??
  PASSPORT_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)!;
