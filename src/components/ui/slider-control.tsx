"use client";

import { cn } from "@/lib/utils";

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Displayed next to the label, e.g. the numeric value or a unit. */
  display?: string;
  onChange: (value: number) => void;
  className?: string;
};

/**
 * Accessible, touch-friendly range control built on the native input so we
 * avoid extra UI dependencies. Styled to match the design tokens.
 */
export const SliderControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
  className,
}: SliderControlProps) => (
  <label className={cn("block", className)}>
    <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
      {label}
      <span className="text-muted-foreground tabular-nums">
        {display ?? value}
      </span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="accent-primary bg-secondary h-2 w-full cursor-pointer appearance-none rounded-full"
      aria-label={label}
    />
  </label>
);
