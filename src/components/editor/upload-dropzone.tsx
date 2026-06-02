"use client";

import { useRef, useState } from "react";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

type UploadDropzoneProps = {
  onFile: (file: File) => void;
};

export const UploadDropzone = ({ onFile }: UploadDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Please upload a JPEG or PNG.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is too large. Maximum size is 15 MB.");
      return;
    }
    setError(null);
    onFile(file);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          dragging
            ? "border-primary bg-accent"
            : "border-border hover:border-primary/60 hover:bg-accent/50",
        )}
      >
        <Icons.upload className="text-muted-foreground size-10" />
        <span className="text-lg font-medium">
          Drop a photo here or click to browse
        </span>
        <span className="text-muted-foreground text-sm">
          JPEG or PNG, up to 15 MB
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />

      {error && (
        <p role="alert" className="text-destructive mt-3 text-center text-sm">
          {error}
        </p>
      )}
    </div>
  );
};
