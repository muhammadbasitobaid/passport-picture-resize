"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SliderControl } from "@/components/ui/slider-control";
import {
  downloadImage,
  downloadSheetPdf,
  downloadSinglePdf,
  printSheet,
  sheetLayout,
} from "@/lib/image/export";
import { DPI, getPreset, presetPx } from "@/lib/passport-presets";

import { useEditorStore } from "./store";

/** Copies slider + export buttons (Print / PNG / JPEG / PDF / Sheet). */
export const ExportControls = () => {
  const specId = useEditorStore((s) => s.specId);
  const copies = useEditorStore((s) => s.copies);
  const busy = useEditorStore((s) => s.busy);
  const disabled = useEditorStore((s) => !s.activeId);
  const setCopies = useEditorStore((s) => s.setCopies);
  const runExport = useEditorStore((s) => s.runExport);

  const preset = getPreset(specId);
  const { width, height } = presetPx(preset);
  const canFit = sheetLayout(preset).count;
  const effectiveCopies = Math.min(copies, canFit);

  return (
    <>
      <SliderControl
        label="Prints on sheet"
        value={effectiveCopies}
        min={1}
        max={Math.max(1, canFit)}
        display={`${effectiveCopies}`}
        onChange={setCopies}
      />

      <div className="flex gap-2">
        <Button
          className="flex-1 gap-1.5"
          onClick={() => runExport((c) => void printSheet(c, preset, copies))}
          disabled={disabled || busy}
        >
          <Icons.printer size={15} /> Print
        </Button>
        <Button
          variant="outline"
          className="text-coral border-coral flex-1 gap-1.5"
          onClick={() =>
            runExport((c) => downloadImage(c, preset, "image/png"))
          }
          disabled={disabled || busy}
        >
          <Icons.download size={15} /> Save PNG
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            runExport((c) => downloadImage(c, preset, "image/jpeg"))
          }
          disabled={disabled || busy}
        >
          JPEG
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => runExport((c) => downloadSinglePdf(c, preset))}
          disabled={disabled || busy}
        >
          PDF
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => runExport((c) => downloadSheetPdf(c, preset, copies))}
          disabled={disabled || busy}
        >
          Sheet
        </Button>
      </div>

      <div className="text-muted-foreground text-center text-[11px]">
        {width}×{height}px · {DPI} dpi
      </div>
    </>
  );
};
