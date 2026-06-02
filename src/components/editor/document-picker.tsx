"use client";

import { useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SliderControl } from "@/components/ui/slider-control";
import {
  DPI,
  PASSPORT_PRESETS,
  PassportPreset,
  presetPx,
} from "@/lib/passport-presets";
import { cn } from "@/lib/utils";

type DocumentPickerProps = {
  specId: string;
  onSpec: (id: string) => void;
  preset: PassportPreset;
  copies: number;
  canFit: number;
  setCopies: (n: number) => void;
  busy: boolean;
  disabled: boolean;
  onPrint: () => void;
  onSavePng: () => void;
  onSaveJpeg: () => void;
  onSavePdf: () => void;
  onSaveSheetPdf: () => void;
};

export const DocumentPicker = ({
  specId,
  onSpec,
  preset,
  copies,
  canFit,
  setCopies,
  busy,
  disabled,
  onPrint,
  onSavePng,
  onSaveJpeg,
  onSavePdf,
  onSaveSheetPdf,
}: DocumentPickerProps) => {
  const [query, setQuery] = useState("");
  const { width, height } = presetPx(preset);
  const filtered = PASSPORT_PRESETS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );
  const effectiveCopies = Math.min(copies, canFit);

  return (
    <aside className="card-surface flex shrink-0 flex-col overflow-hidden lg:w-[280px]">
      <div className="px-4 pt-4 pb-3">
        <span className="font-display text-base font-bold">Document type</span>
        <div className="bg-muted mt-3 flex items-center gap-2 rounded-xl px-3 py-2">
          <Icons.search size={15} className="text-muted-foreground" />
          <input
            placeholder="Search country…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-foreground flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((s) => {
            const on = s.id === specId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSpec(s.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border-[1.5px] p-3 text-left",
                  on
                    ? "border-primary bg-teal-soft"
                    : "bg-muted border-transparent",
                )}
              >
                <span className="text-xl">{s.flag}</span>
                <span className="text-[12.5px] leading-tight font-semibold">
                  {s.name}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {s.widthMm}×{s.heightMm}mm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-border flex flex-col gap-3 border-t px-4 py-4">
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
            onClick={onPrint}
            disabled={disabled || busy}
          >
            <Icons.printer size={15} /> Print
          </Button>
          <Button
            variant="outline"
            className="text-coral border-coral flex-1 gap-1.5"
            onClick={onSavePng}
            disabled={disabled || busy}
          >
            <Icons.download size={15} /> Save PNG
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onSaveJpeg}
            disabled={disabled || busy}
          >
            JPEG
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onSavePdf}
            disabled={disabled || busy}
          >
            PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onSaveSheetPdf}
            disabled={disabled || busy}
          >
            Sheet
          </Button>
        </div>

        <div className="text-muted-foreground text-center text-[11px]">
          {width}×{height}px · {DPI} dpi
        </div>
      </div>
    </aside>
  );
};
