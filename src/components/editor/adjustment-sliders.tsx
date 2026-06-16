"use client";

import { useCallback } from "react";

import { Icons } from "@/components/icons";
import { SliderControl } from "@/components/ui/slider-control";
import { MAX_ZOOM } from "@/lib/image/types";
import { getPreset, presetPx } from "@/lib/passport-presets";
import { cn } from "@/lib/utils";

import { useEditorStore } from "./store";

/** The crop + image-adjustment slider grid. */
export const AdjustmentSliders = () => {
  const crop = useEditorStore((s) => s.crop);
  const adjustments = useEditorStore((s) => s.adjustments);
  const specId = useEditorStore((s) => s.specId);
  const disabled = useEditorStore((s) => !s.activeId);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setOffsetY = useEditorStore((s) => s.setOffsetY);
  const setAdjustments = useEditorStore((s) => s.setAdjustments);

  const outH = presetPx(getPreset(specId)).height;
  const positionValue = Math.max(-0.5, Math.min(0.5, crop.offsetY / outH));

  // Stable per-slider handlers so the memoized SliderControls don't re-render
  // when a sibling slider moves.
  const onPosition = useCallback(
    (v: number) => setOffsetY(v * outH),
    [setOffsetY, outH],
  );
  const onBrightness = useCallback(
    (brightness: number) => setAdjustments({ brightness }),
    [setAdjustments],
  );
  const onContrast = useCallback(
    (contrast: number) => setAdjustments({ contrast }),
    [setAdjustments],
  );
  const onSaturation = useCallback(
    (saturation: number) => setAdjustments({ saturation }),
    [setAdjustments],
  );
  const onSharpness = useCallback(
    (sharpness: number) => setAdjustments({ sharpness }),
    [setAdjustments],
  );

  return (
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
        onChange={setZoom}
      />
      <SliderControl
        icon={Icons.move}
        label="Position"
        value={positionValue}
        min={-0.5}
        max={0.5}
        step={0.005}
        onChange={onPosition}
      />
      <SliderControl
        icon={Icons.sun}
        label="Brightness"
        value={adjustments.brightness}
        min={50}
        max={150}
        display={`${adjustments.brightness - 100}`}
        onChange={onBrightness}
      />
      <SliderControl
        icon={Icons.sunDim}
        label="Contrast"
        value={adjustments.contrast}
        min={50}
        max={150}
        display={`${adjustments.contrast - 100}`}
        onChange={onContrast}
      />
      <SliderControl
        icon={Icons.layers}
        label="Saturation"
        value={adjustments.saturation}
        min={0}
        max={200}
        display={`${adjustments.saturation}`}
        onChange={onSaturation}
      />
      <SliderControl
        icon={Icons.wand}
        label="Sharpness"
        value={adjustments.sharpness}
        min={0}
        max={100}
        display={`${adjustments.sharpness}`}
        onChange={onSharpness}
      />
    </div>
  );
};
