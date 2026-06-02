"use client";

import { useTheme } from "next-themes";
import { useMemo, useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { removeImageBackground } from "@/lib/image/background";
import {
  downloadImage,
  downloadSheetPdf,
  downloadSinglePdf,
  printSheet,
  sheetLayout,
} from "@/lib/image/export";
import { buildSourceCanvas, renderExportCanvas } from "@/lib/image/render";
import {
  Adjustments,
  CropState,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_CROP,
} from "@/lib/image/types";
import { DEFAULT_PRESET_ID, getPreset, presetPx } from "@/lib/passport-presets";

import { BG_COLORS, ControlBar } from "./control-bar";
import { DocumentPicker } from "./document-picker";
import { PhotoStrip } from "./photo-strip";
import { Stage } from "./stage";
import { Photo } from "./types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_BYTES = 15 * 1024 * 1024;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const newId = () => crypto.randomUUID();

export const Editor = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [specId, setSpecId] = useState(DEFAULT_PRESET_ID);
  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP);
  const [adjustments, setAdjustments] =
    useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [bgEnabled, setBgEnabled] = useState(false);
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [copies, setCopies] = useState(6);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preset = getPreset(specId);
  const active = photos.find((p) => p.id === activeId) ?? null;

  const source = useMemo(
    () =>
      active
        ? buildSourceCanvas(
            active.img,
            bgEnabled ? active.foreground : null,
            bgColor,
          )
        : null,
    [active, bgEnabled, bgColor],
  );

  const lowRes = useMemo(() => {
    if (!active) return false;
    const { width, height } = presetPx(preset);
    return Math.max(width / active.img.width, height / active.img.height) > 1;
  }, [active, preset]);

  const canFit = sheetLayout(preset).count;

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Please upload a JPEG or PNG.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("That file is too large. Maximum size is 15 MB.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const src = e.target?.result as string;
        const img = await loadImage(src);
        const id = newId();
        setPhotos((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            src,
            img,
            file,
            foreground: null,
            removing: false,
          },
        ]);
        setActiveId((curr) => curr ?? id);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setActiveId((curr) => {
      if (curr !== id) return curr;
      const rest = photos.filter((p) => p.id !== id);
      return rest[0]?.id ?? null;
    });
  };

  const runRemoval = async (photo: Photo) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, removing: true } : p)),
    );
    try {
      const result = await removeImageBackground(photo.file);
      const fg = await loadImage(URL.createObjectURL(result));
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, foreground: fg, removing: false } : p,
        ),
      );
    } catch {
      setError("Background removal failed. Please try again.");
      setBgEnabled(false);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, removing: false } : p)),
      );
    }
  };

  const toggleBg = (enabled: boolean) => {
    setBgEnabled(enabled);
    if (enabled && active && !active.foreground && !active.removing) {
      void runRemoval(active);
    }
  };

  const resetAdjustments = () => {
    setCrop(DEFAULT_CROP);
    setAdjustments(DEFAULT_ADJUSTMENTS);
  };

  const runExport = async (
    action: (canvas: HTMLCanvasElement) => void | Promise<void>,
  ) => {
    if (!source) return;
    setBusy(true);
    try {
      await action(renderExportCanvas(source, preset, crop, adjustments));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary flex size-9 items-center justify-center rounded-xl shadow-[var(--shadow)]">
            <Icons.sparkles size={18} className="text-white" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Photo<span className="text-primary">Flow</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Icons.sun className="dark:hidden" />
          <Icons.moon className="hidden dark:block" />
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-6 pb-6 lg:h-[calc(100vh-72px)] lg:flex-row lg:overflow-hidden">
        <PhotoStrip
          photos={photos}
          activeId={activeId}
          onSelect={setActiveId}
          onFiles={handleFiles}
          onRemove={removePhoto}
        />

        <main className="card-surface flex min-w-0 flex-1 flex-col overflow-hidden">
          <Stage
            source={source}
            preset={preset}
            crop={crop}
            setCrop={setCrop}
            adjustments={adjustments}
          />
          {(error || lowRes) && (
            <p
              role="alert"
              className="bg-destructive/10 text-destructive mx-6 mb-3 rounded-md px-3 py-2 text-center text-sm"
            >
              {error ??
                "This photo is lower resolution than the selected size needs and may look soft when printed."}
            </p>
          )}
          <ControlBar
            source={source}
            preset={preset}
            crop={crop}
            setCrop={setCrop}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            bgEnabled={bgEnabled}
            removing={!!active?.removing}
            bgColor={bgColor}
            onToggleBg={toggleBg}
            onColor={setBgColor}
            onReset={resetAdjustments}
          />
        </main>

        <DocumentPicker
          specId={specId}
          onSpec={setSpecId}
          preset={preset}
          copies={copies}
          canFit={canFit}
          setCopies={setCopies}
          busy={busy}
          disabled={!source}
          onPrint={() => runExport((c) => void printSheet(c, preset, copies))}
          onSavePng={() =>
            runExport((c) => downloadImage(c, preset, "image/png"))
          }
          onSaveJpeg={() =>
            runExport((c) => downloadImage(c, preset, "image/jpeg"))
          }
          onSavePdf={() => runExport((c) => downloadSinglePdf(c, preset))}
          onSaveSheetPdf={() =>
            runExport((c) => downloadSheetPdf(c, preset, copies))
          }
        />
      </div>
    </div>
  );
};
