import { useMemo } from "react";
import { create } from "zustand";

import { removeImageBackground } from "@/lib/image/background";
import { bgError, bgLog } from "@/lib/image/debug";
import { clampCrop } from "@/lib/image/geometry";
import { buildSourceCanvas, renderExportCanvas } from "@/lib/image/render";
import {
  Adjustments,
  CropState,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_CROP,
} from "@/lib/image/types";
import { getPreset, presetPx } from "@/lib/passport-presets";

import { Photo } from "./types";

/** Flat background colors offered in the control bar (first = default). */
export const BG_COLORS = [
  "#ffffff",
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#9e9e9e",
  "#607d8b",
  "#000000",
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_BYTES = 15 * 1024 * 1024;

const newId = () => crypto.randomUUID();

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

type EditorState = {
  photos: Photo[];
  activeId: string | null;
  specId: string;
  crop: CropState;
  adjustments: Adjustments;
  bgEnabled: boolean;
  /** Flat background color, or null for a transparent background. */
  bgColor: string | null;
  copies: number;
  busy: boolean;
  error: string | null;

  addFiles: (files: FileList) => void;
  removePhoto: (id: string) => void;
  setActive: (id: string) => void;
  setSpec: (id: string) => void;
  setZoom: (zoom: number) => void;
  setOffsetY: (offsetY: number) => void;
  nudgeCrop: (dxOut: number, dyOut: number) => void;
  zoomBy: (factor: number) => void;
  setAdjustments: (patch: Partial<Adjustments>) => void;
  resetAdjustments: () => void;
  toggleBg: (enabled: boolean) => void;
  setBgColor: (color: string | null) => void;
  runRemoval: (photoId: string) => Promise<void>;
  setCopies: (n: number) => void;
  runExport: (
    draw: (canvas: HTMLCanvasElement) => void | Promise<void>,
  ) => Promise<void>;
};

/** Clamp a crop against the active image + current preset's output frame. */
const clampForState = (state: EditorState, crop: CropState): CropState => {
  const active = state.photos.find((p) => p.id === state.activeId);
  if (!active) return crop;
  const { width, height } = presetPx(getPreset(state.specId));
  const imgW = active.img.naturalWidth || active.img.width;
  const imgH = active.img.naturalHeight || active.img.height;
  return clampCrop(imgW, imgH, width, height, crop);
};

export const useEditorStore = create<EditorState>((set, get) => ({
  photos: [],
  activeId: null,
  specId: "us-pass",
  crop: DEFAULT_CROP,
  adjustments: DEFAULT_ADJUSTMENTS,
  bgEnabled: false,
  bgColor: BG_COLORS[0],
  copies: 6,
  busy: false,
  error: null,

  addFiles: (files) => {
    Array.from(files).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        set({ error: "Unsupported file type. Please upload a JPEG or PNG." });
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        set({ error: "That file is too large. Maximum size is 15 MB." });
        return;
      }
      set({ error: null });
      const reader = new FileReader();
      reader.onload = async (e) => {
        const src = e.target?.result as string;
        const img = await loadImage(src);
        const id = newId();
        set((s) => ({
          photos: [
            ...s.photos,
            {
              id,
              name: file.name,
              src,
              img,
              file,
              foreground: null,
              removing: false,
            },
          ],
          activeId: s.activeId ?? id,
        }));
      };
      reader.readAsDataURL(file);
    });
  },

  removePhoto: (id) =>
    set((s) => {
      const photos = s.photos.filter((p) => p.id !== id);
      const activeId = s.activeId === id ? (photos[0]?.id ?? null) : s.activeId;
      return { photos, activeId };
    }),

  setActive: (id) => set({ activeId: id }),
  setSpec: (id) => set({ specId: id }),

  setZoom: (zoom) =>
    set((s) => ({ crop: clampForState(s, { ...s.crop, zoom }) })),
  setOffsetY: (offsetY) =>
    set((s) => ({ crop: clampForState(s, { ...s.crop, offsetY }) })),
  nudgeCrop: (dxOut, dyOut) =>
    set((s) => ({
      crop: clampForState(s, {
        ...s.crop,
        offsetX: s.crop.offsetX + dxOut,
        offsetY: s.crop.offsetY + dyOut,
      }),
    })),
  zoomBy: (factor) =>
    set((s) => ({
      crop: clampForState(s, { ...s.crop, zoom: s.crop.zoom * factor }),
    })),

  setAdjustments: (patch) =>
    set((s) => ({ adjustments: { ...s.adjustments, ...patch } })),
  resetAdjustments: () =>
    set({ crop: DEFAULT_CROP, adjustments: DEFAULT_ADJUSTMENTS }),

  toggleBg: (enabled) => {
    set({ bgEnabled: enabled });
    const s = get();
    const active = s.photos.find((p) => p.id === s.activeId);
    bgLog("toggleBg", {
      enabled,
      activeId: active?.id ?? null,
      foregroundReady: !!active?.foreground,
      removing: active?.removing ?? false,
    });
    if (enabled && active && !active.foreground && !active.removing) {
      void s.runRemoval(active.id);
    }
  },

  setBgColor: (color) => set({ bgColor: color }),

  runRemoval: async (photoId) => {
    const photo = get().photos.find((p) => p.id === photoId);
    if (!photo) return;
    set((s) => ({
      photos: s.photos.map((p) =>
        p.id === photoId ? { ...p, removing: true } : p,
      ),
    }));
    try {
      const fg = await removeImageBackground(photo.img);
      set((s) => ({
        photos: s.photos.map((p) =>
          p.id === photoId ? { ...p, foreground: fg, removing: false } : p,
        ),
      }));
      bgLog("runRemoval:done", { id: photoId });
    } catch (err) {
      bgError("runRemoval:error", err);
      set((s) => ({
        error: "Background removal failed. Please try again.",
        bgEnabled: false,
        photos: s.photos.map((p) =>
          p.id === photoId ? { ...p, removing: false } : p,
        ),
      }));
    }
  },

  setCopies: (n) => set({ copies: n }),

  runExport: async (draw) => {
    const s = get();
    const active = s.photos.find((p) => p.id === s.activeId);
    if (!active) return;
    set({ busy: true });
    try {
      const foreground = s.bgEnabled ? active.foreground : null;
      const source = buildSourceCanvas(active.img, foreground, s.bgColor);
      const preset = getPreset(s.specId);
      await draw(renderExportCanvas(source, preset, s.crop, s.adjustments));
    } finally {
      set({ busy: false });
    }
  },
}));

/**
 * The composited full-resolution source canvas the preview draws from. Only
 * recomputes when the active image / its cut-out / background settings change —
 * NOT on crop or adjustment ticks. Consumed only by the Stage.
 */
export const useSourceCanvas = (): HTMLCanvasElement | null => {
  const img = useEditorStore(
    (s) => s.photos.find((p) => p.id === s.activeId)?.img ?? null,
  );
  const foreground = useEditorStore(
    (s) => s.photos.find((p) => p.id === s.activeId)?.foreground ?? null,
  );
  const bgEnabled = useEditorStore((s) => s.bgEnabled);
  const bgColor = useEditorStore((s) => s.bgColor);
  return useMemo(() => {
    if (!img) return null;
    return buildSourceCanvas(img, bgEnabled ? foreground : null, bgColor);
  }, [img, foreground, bgEnabled, bgColor]);
};
