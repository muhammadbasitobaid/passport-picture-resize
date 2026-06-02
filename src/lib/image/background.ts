/**
 * Client-side background removal. The segmentation model runs in-browser via
 * WASM (lazy-loaded so it stays out of the initial bundle) — the photo never
 * leaves the device. See SPECS.md for the privacy rationale.
 */
export const removeImageBackground = async (source: Blob): Promise<Blob> => {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(source);
};
