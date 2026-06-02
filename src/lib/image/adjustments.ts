import { Adjustments } from "./types";

/** CSS canvas filter for brightness/contrast/saturation (applied during drawImage). */
export const filterString = (adj: Adjustments) =>
  `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;

/**
 * In-place unsharp-style sharpen using a 3×3 convolution, blended by `amount`
 * (0–100). Output canvases are small (passport dimensions), so this is cheap.
 */
export const sharpen = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
) => {
  if (amount <= 0) return;

  const a = (amount / 100) * 1.2; // strength factor
  // Standard sharpen kernel: centre raised, 4-neighbours subtracted.
  const kernel = [0, -a, 0, -a, 1 + 4 * a, -a, 0, -a, 0];

  const src = ctx.getImageData(0, 0, width, height);
  const out = ctx.createImageData(width, height);
  const sd = src.data;
  const od = out.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const di = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx));
            const py = Math.min(height - 1, Math.max(0, y + ky));
            sum += sd[(py * width + px) * 4 + c] * kernel[k++];
          }
        }
        od[di + c] = sum < 0 ? 0 : sum > 255 ? 255 : sum;
      }
      od[di + 3] = sd[di + 3]; // preserve alpha
    }
  }

  ctx.putImageData(out, 0, 0);
};
