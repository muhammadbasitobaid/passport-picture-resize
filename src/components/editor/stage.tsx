"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { clampCrop } from "@/lib/image/geometry";
import { renderToCanvas } from "@/lib/image/render";
import { Adjustments, CropState, DrawSource } from "@/lib/image/types";
import {
  headFraction,
  PassportPreset,
  presetAspect,
  presetPx,
} from "@/lib/passport-presets";

type StageProps = {
  source: DrawSource | null;
  preset: PassportPreset;
  crop: CropState;
  setCrop: Dispatch<SetStateAction<CropState>>;
  adjustments: Adjustments;
};

const PREVIEW_LONG_SIDE = 560; // backing px on the longer axis (× dpr)

export const Stage = ({
  source,
  preset,
  crop,
  setCrop,
  adjustments,
}: StageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);

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
    const ctx = canvas.getContext("2d")!;
    if (source) {
      renderToCanvas(canvas, source, preset, crop, adjustments);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [source, preset, crop, adjustments, aspect]);

  const panBy = (dxCss: number, dyCss: number) => {
    if (!source) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const factor = outW / rect.width;
    setCrop((prev) =>
      clampCrop(source.width, source.height, outW, outH, {
        ...prev,
        offsetX: prev.offsetX + dxCss * factor,
        offsetY: prev.offsetY + dyCss * factor,
      }),
    );
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
      if (pinchDist.current) {
        setCrop((p) =>
          clampCrop(source.width, source.height, outW, outH, {
            ...p,
            zoom: p.zoom * (dist / pinchDist.current),
          }),
        );
      }
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
          onWheel={(e) =>
            source &&
            setCrop((p) =>
              clampCrop(source.width, source.height, outW, outH, {
                ...p,
                zoom: p.zoom * (e.deltaY < 0 ? 1.06 : 0.94),
              }),
            )
          }
          className="block touch-none rounded-[10px] shadow-[var(--shadow)]"
          style={{
            maxHeight: "46vh",
            maxWidth: "100%",
            height: "auto",
            width: "auto",
            aspectRatio: `${outW} / ${outH}`,
            cursor: source ? "grab" : "default",
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
