"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SliderControl } from "@/components/ui/slider-control";
import { clampCrop } from "@/lib/image/geometry";
import { renderToCanvas } from "@/lib/image/render";
import {
  Adjustments,
  CropState,
  DEFAULT_CROP,
  DrawSource,
  MAX_ZOOM,
} from "@/lib/image/types";
import { PassportPreset, presetAspect, presetPx } from "@/lib/passport-presets";

type CropStageProps = {
  source: DrawSource;
  preset: PassportPreset;
  crop: CropState;
  setCrop: Dispatch<SetStateAction<CropState>>;
  adjustments: Adjustments;
};

const PREVIEW_LONG_SIDE = 480; // css px on the longer axis

export const CropStage = ({
  source,
  preset,
  crop,
  setCrop,
  adjustments,
}: CropStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);

  const { width: outW, height: outH } = presetPx(preset);
  const aspect = presetAspect(preset);

  // Redraw whenever inputs change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = aspect >= 1 ? PREVIEW_LONG_SIDE : PREVIEW_LONG_SIDE * aspect;
    const cssH = cssW / aspect;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    renderToCanvas(canvas, source, preset, crop, adjustments);
  }, [source, preset, crop, adjustments, aspect]);

  const update = (next: Partial<CropState>) =>
    setCrop((prev) =>
      clampCrop(source.width, source.height, outW, outH, { ...prev, ...next }),
    );

  const panBy = (dxCss: number, dyCss: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const factor = outW / rect.width; // css px -> output px
    setCrop((prev) =>
      clampCrop(source.width, source.height, outW, outH, {
        ...prev,
        offsetX: prev.offsetX + dxCss * factor,
        offsetY: prev.offsetY + dyCss * factor,
      }),
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const curr = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, curr);

    if (pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current) {
        update({ zoom: crop.zoom * (dist / pinchDist.current) });
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

  const head = preset.headHeightPct ?? [0.55, 0.69];
  const headFrac = (head[0] + head[1]) / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative max-w-full touch-none overflow-hidden rounded-lg border bg-[repeating-conic-gradient(#e5e5e5_0_25%,#fff_0_50%)] bg-[length:20px_20px] shadow-sm"
        style={{ width: aspect >= 1 ? PREVIEW_LONG_SIDE : undefined }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={(e) =>
            update({ zoom: crop.zoom * (e.deltaY < 0 ? 1.06 : 0.94) })
          }
          className="block w-full cursor-grab touch-none active:cursor-grabbing"
          style={{ aspectRatio: `${outW} / ${outH}` }}
        />
        {/* Face-position guide overlay */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        >
          <ellipse
            cx="50"
            cy={44}
            rx={headFrac * 38}
            ry={headFrac * 50}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.6"
            strokeDasharray="2 1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Drag to reposition, scroll or pinch to zoom. Align the face within the
        guide.
      </p>

      <div className="flex w-full max-w-sm items-end gap-3">
        <SliderControl
          className="flex-1"
          label="Zoom"
          value={crop.zoom}
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          display={`${crop.zoom.toFixed(2)}×`}
          onChange={(zoom) => update({ zoom })}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCrop(DEFAULT_CROP)}
        >
          <Icons.reset /> Reset
        </Button>
      </div>
    </div>
  );
};
