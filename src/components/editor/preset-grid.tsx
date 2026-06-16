"use client";

import { useMemo } from "react";

import { PASSPORT_PRESETS } from "@/lib/passport-presets";
import { cn } from "@/lib/utils";

import { useEditorStore } from "./store";

/** Grid of country presets, filtered by the search query. */
export const PresetGrid = ({ query }: { query: string }) => {
  const specId = useEditorStore((s) => s.specId);
  const setSpec = useEditorStore((s) => s.setSpec);

  const filtered = useMemo(
    () =>
      PASSPORT_PRESETS.filter((preset) =>
        preset.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {filtered.map((preset) => {
        const on = preset.id === specId;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => setSpec(preset.id)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border-[1.5px] p-3 text-left",
              on
                ? "border-primary bg-teal-soft"
                : "bg-muted border-transparent",
            )}
          >
            <span className="text-xl">{preset.flag}</span>
            <span className="text-[12.5px] leading-tight font-semibold">
              {preset.name}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {preset.widthMm}×{preset.heightMm}mm
            </span>
          </button>
        );
      })}
    </div>
  );
};
