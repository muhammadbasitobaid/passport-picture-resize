"use client";

import { useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  downloadImage,
  downloadSheetPdf,
  downloadSinglePdf,
  printSheet,
  sheetLayout,
} from "@/lib/image/export";
import { renderExportCanvas } from "@/lib/image/render";
import { Adjustments, CropState, DrawSource } from "@/lib/image/types";
import { PassportPreset } from "@/lib/passport-presets";

type ExportControlsProps = {
  source: DrawSource;
  preset: PassportPreset;
  crop: CropState;
  adjustments: Adjustments;
};

export const ExportControls = ({
  source,
  preset,
  crop,
  adjustments,
}: ExportControlsProps) => {
  const [busy, setBusy] = useState(false);

  const sheet = sheetLayout(preset);

  // Render fresh at full resolution for each action.
  const render = () => renderExportCanvas(source, preset, crop, adjustments);

  const run = async (
    action: (canvas: HTMLCanvasElement) => void | Promise<void>,
  ) => {
    setBusy(true);
    try {
      await action(render());
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Export &amp; print</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => run((c) => downloadImage(c, preset, "image/jpeg"))}
        >
          <Icons.download /> JPEG
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => run((c) => downloadImage(c, preset, "image/png"))}
        >
          <Icons.download /> PNG
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => run((c) => downloadSinglePdf(c, preset))}
        >
          <Icons.download /> PDF
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => run((c) => downloadSheetPdf(c, preset))}
        >
          <Icons.download /> PDF sheet
        </Button>
      </div>
      <Button
        className="w-full"
        disabled={busy}
        onClick={() => run((c) => void printSheet(c, preset))}
      >
        <Icons.printer /> Print sheet
      </Button>
      <p className="text-muted-foreground text-xs">
        The print sheet fits {sheet.count} copies on an A4 page at true size.
      </p>
    </section>
  );
};
