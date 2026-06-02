/** A 2D source the canvas can draw from. */
export type DrawSource = HTMLImageElement | HTMLCanvasElement;

/** Pan/zoom of the crop frame, expressed in output-pixel space. */
export type CropState = {
  /** 1 = fit (cover); higher = zoomed in. */
  zoom: number;
  /** Horizontal pan of the image centre, in output pixels. */
  offsetX: number;
  /** Vertical pan of the image centre, in output pixels. */
  offsetY: number;
};

export const DEFAULT_CROP: CropState = { zoom: 1, offsetX: 0, offsetY: 0 };

/** Non-destructive image adjustments. Neutral = no visible change. */
export type Adjustments = {
  /** Percent, 100 = neutral. */
  brightness: number;
  /** Percent, 100 = neutral. */
  contrast: number;
  /** Percent, 100 = neutral. */
  saturation: number;
  /** Sharpen amount, 0 = off (range 0–100). */
  sharpness: number;
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,
};

export const MAX_ZOOM = 3;
