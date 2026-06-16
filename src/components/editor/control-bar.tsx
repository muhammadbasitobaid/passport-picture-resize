"use client";

import { Button } from "@/components/ui/button";

import { AdjustmentSliders } from "./adjustment-sliders";
import { BackgroundPalette } from "./background-palette";
import { BackgroundToggle } from "./background-toggle";
import { useEditorStore } from "./store";

/** Composes the background controls and the adjustment-slider grid. */
export const ControlBar = () => {
  const disabled = useEditorStore((s) => !s.activeId);
  const resetAdjustments = useEditorStore((s) => s.resetAdjustments);

  return (
    <div className="border-border border-t px-6 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-base font-bold">Adjust</span>
        <div className="flex items-center gap-2">
          <BackgroundToggle />
          <Button
            variant="secondary"
            onClick={resetAdjustments}
            disabled={disabled}
          >
            Reset
          </Button>
        </div>
      </div>

      <BackgroundPalette />
      <AdjustmentSliders />
    </div>
  );
};
