"use client";

import { Icons } from "@/components/icons";

type PresetSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Controlled search box for filtering the country presets. */
export const PresetSearch = ({ value, onChange }: PresetSearchProps) => (
  <div className="bg-muted mt-3 flex items-center gap-2 rounded-xl px-3 py-2">
    <Icons.search size={15} className="text-muted-foreground" />
    <input
      placeholder="Search country…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-foreground flex-1 bg-transparent text-sm outline-none"
    />
  </div>
);
