"use client";

import { getPreset, presetPx } from "@/lib/passport-presets";

import { useEditorStore } from "./store";

/** Shows the upload/processing error, or a low-resolution warning. */
export const StatusBanner = () => {
  const error = useEditorStore((s) => s.error);
  const lowRes = useEditorStore((s) => {
    const active = s.photos.find((p) => p.id === s.activeId);
    if (!active) return false;
    const { width, height } = presetPx(getPreset(s.specId));
    return Math.max(width / active.img.width, height / active.img.height) > 1;
  });

  if (!error && !lowRes) return null;

  return (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive mx-6 mb-3 rounded-md px-3 py-2 text-center text-sm"
    >
      {error ??
        "This photo is lower resolution than the selected size needs and may look soft when printed."}
    </p>
  );
};
