"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SliderControl } from "@/components/ui/slider-control";
import { Adjustments, DEFAULT_ADJUSTMENTS } from "@/lib/image/types";

type AdjustmentControlsProps = {
  value: Adjustments;
  onChange: (value: Adjustments) => void;
};

export const AdjustmentControls = ({
  value,
  onChange,
}: AdjustmentControlsProps) => {
  const set = (patch: Partial<Adjustments>) => onChange({ ...value, ...patch });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Adjustments</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
        >
          <Icons.reset /> Reset
        </Button>
      </div>

      <SliderControl
        label="Brightness"
        value={value.brightness}
        min={0}
        max={200}
        display={`${value.brightness - 100}`}
        onChange={(brightness) => set({ brightness })}
      />
      <SliderControl
        label="Contrast"
        value={value.contrast}
        min={0}
        max={200}
        display={`${value.contrast - 100}`}
        onChange={(contrast) => set({ contrast })}
      />
      <SliderControl
        label="Sharpness"
        value={value.sharpness}
        min={0}
        max={100}
        display={`${value.sharpness}`}
        onChange={(sharpness) => set({ sharpness })}
      />
    </section>
  );
};
