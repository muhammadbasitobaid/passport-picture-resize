"use client";

import { PASSPORT_PRESETS, presetPx } from "@/lib/passport-presets";

type CountrySelectProps = {
  value: string;
  onChange: (id: string) => void;
};

export const CountrySelect = ({ value, onChange }: CountrySelectProps) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        Country / document size
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
      >
        {PASSPORT_PRESETS.map((preset) => {
          const { width, height } = presetPx(preset);
          return (
            <option key={preset.id} value={preset.id}>
              {preset.name} — {width}×{height}px
            </option>
          );
        })}
      </select>
    </label>
  );
};
