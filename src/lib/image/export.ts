import { jsPDF } from "jspdf";

import { PassportPreset } from "@/lib/passport-presets";

export type ImageFormat = "image/jpeg" | "image/png";

export const buildFilename = (preset: PassportPreset, ext: string) =>
  `passport_${preset.countryCode}_${preset.widthMm}x${preset.heightMm}.${ext}`;

const canvasToBlob = (canvas: HTMLCanvasElement, type: ImageFormat) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      type === "image/jpeg" ? 0.95 : undefined,
    );
  });

const triggerDownload = (href: string, filename: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/** Download the rendered canvas as a JPEG or PNG at exact preset pixels. */
export const downloadImage = async (
  canvas: HTMLCanvasElement,
  preset: PassportPreset,
  type: ImageFormat,
) => {
  const blob = await canvasToBlob(canvas, type);
  const url = URL.createObjectURL(blob);
  triggerDownload(
    url,
    buildFilename(preset, type === "image/jpeg" ? "jpg" : "png"),
  );
  URL.revokeObjectURL(url);
};

/** Download a PDF containing a single photo at true physical size. */
export const downloadSinglePdf = (
  canvas: HTMLCanvasElement,
  preset: PassportPreset,
) => {
  const data = canvas.toDataURL("image/jpeg", 0.95);
  const portrait = preset.heightMm >= preset.widthMm;
  const pdf = new jsPDF({
    orientation: portrait ? "portrait" : "landscape",
    unit: "mm",
    format: [preset.widthMm, preset.heightMm],
  });
  pdf.addImage(data, "JPEG", 0, 0, preset.widthMm, preset.heightMm);
  pdf.save(buildFilename(preset, "pdf"));
};

const A4 = { width: 210, height: 297, margin: 8, gap: 4 };

/** How many copies fit on an A4 sheet for this preset. */
export const sheetLayout = (preset: PassportPreset) => {
  const usableW = A4.width - 2 * A4.margin;
  const usableH = A4.height - 2 * A4.margin;
  const cols = Math.max(
    1,
    Math.floor((usableW + A4.gap) / (preset.widthMm + A4.gap)),
  );
  const rows = Math.max(
    1,
    Math.floor((usableH + A4.gap) / (preset.heightMm + A4.gap)),
  );
  return { cols, rows, count: cols * rows };
};

/** Download an A4 PDF tiled with as many copies as fit. */
export const downloadSheetPdf = (
  canvas: HTMLCanvasElement,
  preset: PassportPreset,
) => {
  const data = canvas.toDataURL("image/jpeg", 0.95);
  const { cols, rows } = sheetLayout(preset);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = A4.margin + c * (preset.widthMm + A4.gap);
      const y = A4.margin + r * (preset.heightMm + A4.gap);
      pdf.addImage(data, "JPEG", x, y, preset.widthMm, preset.heightMm);
    }
  }
  pdf.save(buildFilename(preset, "sheet.pdf"));
};

/**
 * Open a print-ready A4 sheet in a new window and invoke the browser print
 * dialog. Photos are sized in millimetres so they print at true size at 100%.
 */
export const printSheet = (
  canvas: HTMLCanvasElement,
  preset: PassportPreset,
) => {
  const data = canvas.toDataURL("image/jpeg", 0.95);
  const { count } = sheetLayout(preset);
  const win = window.open("", "_blank");
  if (!win) return false;

  const imgs = Array.from(
    { length: count },
    () =>
      `<img src="${data}" style="width:${preset.widthMm}mm;height:${preset.heightMm}mm;" />`,
  ).join("");

  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
<title>${buildFilename(preset, "sheet")}</title>
<style>
  @page { size: A4; margin: ${A4.margin}mm; }
  html,body { margin:0; padding:0; }
  .sheet { display:flex; flex-wrap:wrap; gap:${A4.gap}mm; }
  img { display:block; }
</style></head>
<body><div class="sheet">${imgs}</div>
<script>
  window.onload = function () {
    var n = document.images.length, loaded = 0;
    function go(){ window.focus(); window.print(); }
    if (n === 0) return go();
    for (var i=0;i<n;i++){
      var im = document.images[i];
      if (im.complete) { if(++loaded===n) go(); }
      else im.onload = im.onerror = function(){ if(++loaded===n) go(); };
    }
  };
<\/script></body></html>`);
  win.document.close();
  return true;
};
