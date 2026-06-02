"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const BG_COLORS = ["#ffffff", "#f5f1e8", "#d6e4f0", "#e3e3e3"];

type BackgroundControlsProps = {
  hasForeground: boolean;
  removing: boolean;
  enabled: boolean;
  color: string;
  error: string | null;
  onRemove: () => void;
  onToggle: (enabled: boolean) => void;
  onColor: (color: string) => void;
};

export const BackgroundControls = ({
  hasForeground,
  removing,
  enabled,
  color,
  error,
  onRemove,
  onToggle,
  onColor,
}: BackgroundControlsProps) => {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Background</h3>

      {!hasForeground ? (
        <Button
          variant="secondary"
          className="w-full"
          disabled={removing}
          onClick={onRemove}
        >
          {removing ? (
            <Icons.spinner className="animate-spin" />
          ) : (
            <Icons.sparkles />
          )}
          {removing ? "Removing background…" : "Remove background"}
        </Button>
      ) : (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary size-4"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
            />
            Replace background
          </label>

          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              !enabled && "pointer-events-none opacity-50",
            )}
          >
            {BG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => onColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "size-8 rounded-full border shadow-sm transition-transform hover:scale-110",
                  color.toLowerCase() === c &&
                    "ring-primary ring-2 ring-offset-2",
                )}
              />
            ))}
            <label className="relative size-8 cursor-pointer">
              <input
                type="color"
                value={color}
                onChange={(e) => onColor(e.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                aria-label="Custom color"
              />
              <span
                className="block size-8 rounded-full border bg-[conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)] shadow-sm"
                aria-hidden
              />
            </label>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Background removal runs locally in your browser the first time it loads
        a model.
      </p>
    </section>
  );
};
