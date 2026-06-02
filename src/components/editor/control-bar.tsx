"use client";

import { Dispatch, SetStateAction } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SliderControl } from "@/components/ui/slider-control";
import { Switch } from "@/components/ui/switch";
import { clampCrop } from "@/lib/image/geometry";
import {
  Adjustments,
  CropState,
  DrawSource,
  MAX_ZOOM,
} from "@/lib/image/types";
import { PassportPreset, presetPx } from "@/lib/passport-presets";
import { cn } from "@/lib/utils";

export const BG_COLORS = ["#ffffff", "#f5f1e8", "#d6e4f0", "#e3e3e3"];

type ControlBarProps = {
  source: DrawSource | null;
  preset: PassportPreset;
  crop: CropState;
  setCrop: Dispatch<SetStateAction<CropState>>;
  adjustments: Adjustments;
  setAdjustments: (value: Adjustments) => void;
  bgEnabled: boolean;
  removing: boolean;
  bgColor: string;
  onToggleBg: (enabled: boolean) => void;
  onColor: (color: string) => void;
  onReset: () => void;
};

export const ControlBar = ({
  source,
  preset,
  crop,
  setCrop,
  adjustments,
  setAdjustments,
  bgEnabled,
  removing,
  bgColor,
  onToggleBg,
  onColor,
  onReset,
}: ControlBarProps) => {
  const { height: outH } = presetPx(preset);
  const disabled = !source;
  const set = (patch: Partial<Adjustments>) =>
    setAdjustments({ ...adjustments, ...patch });

  const clamp = (next: Partial<CropState>) => {
    if (!source) return;
    setCrop((prev) =>
      clampCrop(source.width, source.height, presetPx(preset).width, outH, {
        ...prev,
        ...next,
      }),
    );
  };

  const positionValue = Math.max(-0.5, Math.min(0.5, crop.offsetY / outH));

  return (
    <div className="border-border border-t px-6 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-base font-bold">Adjust</span>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5",
              bgEnabled ? "bg-teal-soft" : "bg-muted",
            )}
          >
            {removing ? (
              <Icons.spinner size={14} className="text-primary animate-spin" />
            ) : (
              <Icons.wand
                size={14}
                className={bgEnabled ? "text-primary" : "text-muted-foreground"}
              />
            )}
            <span
              className={cn(
                "text-[13px] font-semibold",
                bgEnabled ? "text-primary" : "text-muted-foreground",
              )}
            >
              Remove BG
            </span>
            <Switch
              checked={bgEnabled}
              onCheckedChange={onToggleBg}
              aria-label="Remove background"
            />
          </div>

          {bgEnabled && (
            <div className="flex items-center gap-1.5">
              {BG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => onColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "size-6 rounded-full border shadow-sm",
                    bgColor.toLowerCase() === c && "ring-primary ring-2",
                  )}
                />
              ))}
              <input
                type="color"
                value={bgColor}
                onChange={(e) => onColor(e.target.value)}
                className="size-7 cursor-pointer rounded-md border-none bg-transparent"
                aria-label="Custom background color"
              />
            </div>
          )}

          <Button variant="secondary" onClick={onReset} disabled={disabled}>
            Reset
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <SliderControl
          icon={Icons.zoom}
          label="Zoom"
          value={crop.zoom}
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          display={`${crop.zoom.toFixed(2)}×`}
          onChange={(zoom) => clamp({ zoom })}
        />
        <SliderControl
          icon={Icons.move}
          label="Position"
          value={positionValue}
          min={-0.5}
          max={0.5}
          step={0.005}
          onChange={(v) => clamp({ offsetY: v * outH })}
        />
        <SliderControl
          icon={Icons.sun}
          label="Brightness"
          value={adjustments.brightness}
          min={50}
          max={150}
          display={`${adjustments.brightness - 100}`}
          onChange={(brightness) => set({ brightness })}
        />
        <SliderControl
          icon={Icons.sunDim}
          label="Contrast"
          value={adjustments.contrast}
          min={50}
          max={150}
          display={`${adjustments.contrast - 100}`}
          onChange={(contrast) => set({ contrast })}
        />
        <SliderControl
          icon={Icons.layers}
          label="Saturation"
          value={adjustments.saturation}
          min={0}
          max={200}
          display={`${adjustments.saturation}`}
          onChange={(saturation) => set({ saturation })}
        />
        <SliderControl
          icon={Icons.wand}
          label="Sharpness"
          value={adjustments.sharpness}
          min={0}
          max={100}
          display={`${adjustments.sharpness}`}
          onChange={(sharpness) => set({ sharpness })}
        />
      </div>
    </div>
  );
};
