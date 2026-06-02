"use client";

import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Optional leading icon (Knob style). */
  icon?: LucideIcon;
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
  icon: Icon,
  display,
  onChange,
  className,
}: SliderControlProps) => (
  <label className={cn("block", className)}>
    <span className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[13px] font-semibold">
      {Icon && <Icon size={14} className="text-primary" />}
      {label}
      {display !== undefined && (
        <span className="ml-auto tabular-nums">{display}</span>
      )}
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
