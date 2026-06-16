"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

import { BG_COLORS, useEditorStore } from "./store";

/**
 * Horizontal-scroll background swatch row: transparent, a custom color picker,
 * and the preset palette. Owns the picker debounce so dragging the color input
 * only commits (and rebuilds the composited canvas) once the user pauses.
 */
export const BackgroundPalette = () => {
  const bgEnabled = useEditorStore((s) => s.bgEnabled);
  const bgColor = useEditorStore((s) => s.bgColor);
  const setBgColor = useEditorStore((s) => s.setBgColor);

  const [pickerColor, setPickerColor] = useState(
    typeof bgColor === "string" ? bgColor : "#ffffff",
  );
  useEffect(() => {
    if (typeof bgColor === "string") setPickerColor(bgColor);
  }, [bgColor]);

  const pickTimer = useRef(0);
  const latestHex = useRef<string | null>(null);
  const onPickColor = useCallback(
    (hex: string) => {
      setPickerColor(hex);
      latestHex.current = hex;
      // Cancel the previous pending commit; only the most recent hex is applied.
      window.clearTimeout(pickTimer.current);
      pickTimer.current = window.setTimeout(() => {
        if (latestHex.current !== null) setBgColor(latestHex.current);
      }, 200);
    },
    [setBgColor],
  );
  useEffect(() => () => window.clearTimeout(pickTimer.current), []);

  const isCustom = typeof bgColor === "string" && !BG_COLORS.includes(bgColor);

  if (!bgEnabled) return null;

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
      {/* Transparent / no background */}
      <button
        type="button"
        aria-label="Transparent background"
        title="Transparent"
        onClick={() => setBgColor(null)}
        className={cn(
          "text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm",
          bgColor === null && "ring-primary ring-2",
        )}
      >
        <Icons.none size={16} />
      </button>

      {/* Custom color picker */}
      <label
        className={cn(
          "relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-xl border shadow-sm",
          isCustom && "ring-primary ring-2",
        )}
        title="Custom color"
        style={{
          background:
            "conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)",
        }}
      >
        <input
          type="color"
          value={pickerColor}
          onInput={(e) => onPickColor((e.target as HTMLInputElement).value)}
          onChange={(e) => onPickColor(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label="Custom background color"
        />
      </label>

      {/* Preset palette */}
      {BG_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          onClick={() => setBgColor(c)}
          style={{ backgroundColor: c }}
          className={cn(
            "size-9 shrink-0 rounded-xl border shadow-sm",
            bgColor === c && "ring-primary ring-2",
          )}
        />
      ))}
    </div>
  );
};
