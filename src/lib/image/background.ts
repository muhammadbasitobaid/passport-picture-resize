import { bgError, bgLog } from "./debug";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      quality,
    ),
  );

/** Draw an image onto a new, full-resolution canvas (preserves any alpha). */
const toCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  return canvas;
};

/**
 * Remove the background and return a FULL-RESOLUTION cut-out canvas.
 *
 * Inference runs in the BiRefNet-lite microservice (services/bg-removal),
 * reached through the Next.js route handler at `/api/remove-bg`. We send the
 * original photo as a JPEG, get back an RGBA PNG cut-out, and draw it onto a
 * canvas. `buildSourceCanvas` then composites it over the chosen flat colour.
 * The cut-out keeps the resolution of the image we upload.
 *
 * NOTE: the photo leaves the device (it is sent to our own server). This is
 * consistent with the planned cloud storage.
 */
export const removeImageBackground = async (
  original: HTMLImageElement,
): Promise<HTMLCanvasElement> => {
  const t0 = performance.now();
  const source = toCanvas(original);
  const input = await toBlob(source, "image/jpeg", 0.92);
  bgLog("removeImageBackground:start", {
    size: `${source.width}×${source.height}`,
    inKB: Math.round(input.size / 1024),
  });

  const form = new FormData();
  form.append("file", input, "photo.jpg");

  let res: Response;
  try {
    res = await fetch("/api/remove-bg", { method: "POST", body: form });
  } catch (err) {
    bgError("removeImageBackground:networkError", err);
    throw new Error("Background removal request failed");
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    bgError("removeImageBackground:httpError", { status: res.status, detail });
    throw new Error(`Background removal failed (${res.status})`);
  }

  const outUrl = URL.createObjectURL(await res.blob());
  try {
    const cutout = await loadImage(outUrl);
    const canvas = toCanvas(cutout);
    bgLog("removeImageBackground:done", {
      ms: Math.round(performance.now() - t0),
      inferenceMs: res.headers.get("X-Inference-Ms"),
      size: `${canvas.width}×${canvas.height}`,
    });
    return canvas;
  } finally {
    URL.revokeObjectURL(outUrl);
  }
};
