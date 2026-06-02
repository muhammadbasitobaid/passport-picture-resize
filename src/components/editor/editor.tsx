"use client";

import { useEffect, useMemo, useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { removeImageBackground } from "@/lib/image/background";
import { buildSourceCanvas } from "@/lib/image/render";
import {
  Adjustments,
  CropState,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_CROP,
} from "@/lib/image/types";
import { DEFAULT_PRESET_ID, getPreset, presetPx } from "@/lib/passport-presets";

import { AdjustmentControls } from "./adjustment-controls";
import { BackgroundControls, BG_COLORS } from "./background-controls";
import { CountrySelect } from "./country-select";
import { CropStage } from "./crop-stage";
import { ExportControls } from "./export-controls";
import { UploadDropzone } from "./upload-dropzone";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const Editor = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP);
  const [adjustments, setAdjustments] =
    useState<Adjustments>(DEFAULT_ADJUSTMENTS);

  const [foreground, setForeground] = useState<HTMLImageElement | null>(null);
  const [bgEnabled, setBgEnabled] = useState(true);
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [removing, setRemoving] = useState(false);
  const [bgError, setBgError] = useState<string | null>(null);

  const preset = getPreset(presetId);

  const loadFile = async (file: File) => {
    const img = await loadImage(URL.createObjectURL(file));
    setImage(img);
    setBlob(file);
    setCrop(DEFAULT_CROP);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setForeground(null);
    setBgError(null);
  };

  // Reset framing when the target aspect ratio changes.
  useEffect(() => setCrop(DEFAULT_CROP), [presetId]);

  const source = useMemo(
    () =>
      image
        ? buildSourceCanvas(image, bgEnabled ? foreground : null, bgColor)
        : null,
    [image, foreground, bgEnabled, bgColor],
  );

  const lowRes = useMemo(() => {
    if (!image) return false;
    const { width, height } = presetPx(preset);
    return Math.max(width / image.width, height / image.height) > 1;
  }, [image, preset]);

  const handleRemoveBackground = async () => {
    if (!blob) return;
    setRemoving(true);
    setBgError(null);
    try {
      const result = await removeImageBackground(blob);
      const fg = await loadImage(URL.createObjectURL(result));
      setForeground(fg);
      setBgEnabled(true);
    } catch {
      setBgError("Background removal failed. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  if (!image || !source) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-extrabold tracking-tight md:text-4xl">
            Passport Picture Resize
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Upload a photo, pick your country, adjust, and export a print-ready
            passport picture. Everything runs in your browser — your photo never
            leaves your device.
          </p>
        </div>
        <UploadDropzone onFile={loadFile} />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col items-center gap-4">
        <CropStage
          source={source}
          preset={preset}
          crop={crop}
          setCrop={setCrop}
          adjustments={adjustments}
        />
        {lowRes && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-center text-sm"
          >
            This photo is lower resolution than the selected size needs and may
            look soft when printed.
          </p>
        )}
        <Button variant="ghost" size="sm" onClick={() => setImage(null)}>
          <Icons.close /> Change photo
        </Button>
      </div>

      <div className="space-y-6 rounded-xl border p-5">
        <CountrySelect value={presetId} onChange={setPresetId} />
        <AdjustmentControls value={adjustments} onChange={setAdjustments} />
        <BackgroundControls
          hasForeground={!!foreground}
          removing={removing}
          enabled={bgEnabled}
          color={bgColor}
          error={bgError}
          onRemove={handleRemoveBackground}
          onToggle={setBgEnabled}
          onColor={setBgColor}
        />
        <ExportControls
          source={source}
          preset={preset}
          crop={crop}
          adjustments={adjustments}
        />
      </div>
    </div>
  );
};
