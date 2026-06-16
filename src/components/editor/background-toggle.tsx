"use client";

import { Icons } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { useEditorStore } from "./store";

/** The "Remove BG" pill: toggles background removal for the active photo. */
export const BackgroundToggle = () => {
  const bgEnabled = useEditorStore((s) => s.bgEnabled);
  const toggleBg = useEditorStore((s) => s.toggleBg);
  const removing = useEditorStore((s) => {
    const active = s.photos.find((p) => p.id === s.activeId);
    return active?.removing ?? false;
  });

  return (
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
        onCheckedChange={toggleBg}
        aria-label="Remove background"
      />
    </div>
  );
};
