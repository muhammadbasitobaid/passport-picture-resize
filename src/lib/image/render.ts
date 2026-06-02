import { PassportPreset, presetPx } from "@/lib/passport-presets";

import { filterString, sharpen } from "./adjustments";
import { computeSourceRect } from "./geometry";
import { Adjustments, CropState, DrawSource } from "./types";

/**
 * Build the full-resolution source the cropper draws from: either the original
 * image, or — when the background has been removed — the cut-out foreground
 * composited over the chosen flat colour.
 */
export const buildSourceCanvas = (
  original: DrawSource,
  foreground: DrawSource | null,
  bgColor: string | null,
): HTMLCanvasElement => {
  const base = foreground ?? original;
  const canvas = document.createElement("canvas");
  canvas.width = base.width;
  canvas.height = base.height;
  const ctx = canvas.getContext("2d")!;

  if (foreground && bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(base, 0, 0);
  return canvas;
};

/**
 * Render the cropped, adjusted result into `target`. Crop offsets live in the
 * preset's output-pixel space, so this produces identical framing whether
 * `target` is a small preview canvas or a full-size export canvas.
 */
export const renderToCanvas = (
  target: HTMLCanvasElement,
  source: DrawSource,
  preset: PassportPreset,
  crop: CropState,
  adj: Adjustments,
) => {
  const { width: outW, height: outH } = presetPx(preset);
  const rect = computeSourceRect(source.width, source.height, outW, outH, crop);
  const ctx = target.getContext("2d")!;

  ctx.clearRect(0, 0, target.width, target.height);
  ctx.imageSmoothingQuality = "high";
  ctx.filter = filterString(adj);
  ctx.drawImage(
    source,
    rect.sx,
    rect.sy,
    rect.sW,
    rect.sH,
    0,
    0,
    target.width,
    target.height,
  );
  ctx.filter = "none";

  sharpen(ctx, target.width, target.height, adj.sharpness);
};

/** Produce the final export-resolution canvas at the preset's exact pixels. */
export const renderExportCanvas = (
  source: DrawSource,
  preset: PassportPreset,
  crop: CropState,
  adj: Adjustments,
): HTMLCanvasElement => {
  const { width, height } = presetPx(preset);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  renderToCanvas(canvas, source, preset, crop, adj);
  return canvas;
};
