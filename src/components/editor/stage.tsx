"use client";

import { useEffect, useRef } from "react";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { renderToCanvas } from "@/lib/image/render";
import {
  getPreset,
  headFraction,
  presetAspect,
  presetPx,
} from "@/lib/passport-presets";

import { useEditorStore, useSourceCanvas } from "./store";

const PREVIEW_LONG_SIDE = 560; // backing px on the longer axis (× dpr)
const SHARPEN_SETTLE_MS = 120;

// Classic transparency checkerboard, shown behind the canvas when the
// background has been removed but no replacement color is selected.
const CHECKER_BG = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "linear-gradient(45deg, #d4d4d8 25%, transparent 25%), linear-gradient(-45deg, #d4d4d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d8 75%), linear-gradient(-45deg, transparent 75%, #d4d4d8 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
} as const;

export const Stage = () => {
  const source = useSourceCanvas();
  const crop = useEditorStore((s) => s.crop);
  const adjustments = useEditorStore((s) => s.adjustments);
  const specId = useEditorStore((s) => s.specId);
  const nudgeCrop = useEditorStore((s) => s.nudgeCrop);
  const zoomBy = useEditorStore((s) => s.zoomBy);
  // Background removed with no replacement color → show the checkerboard.
  const transparent = useEditorStore((s) => s.bgEnabled && s.bgColor === null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);
  const rafRef = useRef(0);
  const settleRef = useRef(0);

  const preset = getPreset(specId);
  const { width: outW, height: outH } = presetPx(preset);
  const aspect = presetAspect(preset);
  const headPct = headFraction(preset) * 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = aspect >= 1 ? PREVIEW_LONG_SIDE : PREVIEW_LONG_SIDE * aspect;
    const cssH = cssW / aspect;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    // Coalesce rapid updates (slider drags) into at most one draw per frame.
    cancelAnimationFrame(rafRef.current);
    window.clearTimeout(settleRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const ctx = canvas.getContext("2d")!;
      if (!source) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      // Fast pass: skip the expensive sharpen convolution for instant feedback.
      renderToCanvas(canvas, source, preset, crop, adjustments, false);
      // Settle pass: apply sharpen once the user stops moving.
      if (adjustments.sharpness > 0) {
        settleRef.current = window.setTimeout(() => {
          renderToCanvas(canvas, source, preset, crop, adjustments, true);
        }, SHARPEN_SETTLE_MS);
      }
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(settleRef.current);
    };
  }, [source, preset, crop, adjustments, aspect]);

  const panBy = (dxCss: number, dyCss: number) => {
    if (!source) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const factor = outW / rect.width;
    nudgeCrop(dxCss * factor, dyCss * factor);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!source) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !source) return;
    const curr = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, curr);

    if (pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current) zoomBy(dist / pinchDist.current);
      pinchDist.current = dist;
    } else {
      panBy(curr.x - prev.x, curr.y - prev.y);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = 0;
  };

  return (
    <div
      className="relative flex flex-1 items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, var(--stage-from), var(--stage-to))",
      }}
    >
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={(e) => source && zoomBy(e.deltaY < 0 ? 1.06 : 0.94)}
          className="block touch-none rounded-[10px] shadow-[var(--shadow)]"
          style={{
            maxHeight: "46vh",
            maxWidth: "100%",
            height: "auto",
            width: "auto",
            aspectRatio: `${outW} / ${outH}`,
            cursor: source ? "grab" : "default",
            ...(transparent && source ? CHECKER_BG : null),
          }}
        />

        {source && (
          <div className="pointer-events-none absolute inset-0">
            <div
              className="bg-primary/40 absolute top-[6%] bottom-[6%] left-1/2 w-px"
              aria-hidden
            />
            <div
              className="bg-primary/70 absolute right-[16%] left-[16%] h-0.5 rounded"
              style={{ top: `${(100 - headPct) / 2}%` }}
              aria-hidden
            />
            <div
              className="bg-primary/70 absolute right-[16%] left-[16%] h-0.5 rounded"
              style={{ bottom: `${(100 - headPct) / 2}%` }}
              aria-hidden
            />
          </div>
        )}

        {!source && (
          <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2.5">
            <Icons.camera size={32} />
            <span className="text-sm font-semibold">
              Upload a photo to start
            </span>
          </div>
        )}
      </div>

      {source && (
        <Badge className="bg-card text-foreground absolute bottom-3.5 left-3.5 shadow-[var(--shadow)]">
          {preset.flag} {preset.name} · {preset.widthMm}×{preset.heightMm}mm
        </Badge>
      )}
    </div>
  );
};
