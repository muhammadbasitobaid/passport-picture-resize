import { CropState, MAX_ZOOM } from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export type SourceRect = { sx: number; sy: number; sW: number; sH: number };

/**
 * The "cover" scale that makes the image fully fill the output frame at zoom 1
 * (display px per source px).
 */
const baseScale = (imgW: number, imgH: number, outW: number, outH: number) =>
  Math.max(outW / imgW, outH / imgH);

/**
 * Compute the rectangle of the source image that maps onto the output frame,
 * given the current pan/zoom. Offsets are in output-pixel space, so the same
 * crop renders identically at any preview size — only the destination canvas
 * dimensions differ between preview and export.
 */
export const computeSourceRect = (
  imgW: number,
  imgH: number,
  outW: number,
  outH: number,
  crop: CropState,
): SourceRect => {
  const scale = baseScale(imgW, imgH, outW, outH) * crop.zoom;
  const sW = outW / scale;
  const sH = outH / scale;

  // Max pan keeps the source rect inside the image bounds.
  const maxOffsetX = (scale * (imgW - sW)) / 2;
  const maxOffsetY = (scale * (imgH - sH)) / 2;
  const offsetX = clamp(crop.offsetX, -maxOffsetX, maxOffsetX);
  const offsetY = clamp(crop.offsetY, -maxOffsetY, maxOffsetY);

  const sx = (imgW - sW) / 2 - offsetX / scale;
  const sy = (imgH - sH) / 2 - offsetY / scale;

  return { sx, sy, sW, sH };
};

/** Clamp a crop state to valid zoom and pan ranges for the given image/frame. */
export const clampCrop = (
  imgW: number,
  imgH: number,
  outW: number,
  outH: number,
  crop: CropState,
): CropState => {
  const zoom = clamp(crop.zoom, 1, MAX_ZOOM);
  const scale = baseScale(imgW, imgH, outW, outH) * zoom;
  const sW = outW / scale;
  const sH = outH / scale;
  const maxOffsetX = (scale * (imgW - sW)) / 2;
  const maxOffsetY = (scale * (imgH - sH)) / 2;
  return {
    zoom,
    offsetX: clamp(crop.offsetX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(crop.offsetY, -maxOffsetY, maxOffsetY),
  };
};
