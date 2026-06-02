"use client";

import { useRef, useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Photo } from "./types";

type PhotoStripProps = {
  photos: Photo[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onFiles: (files: FileList) => void;
  onRemove: (id: string) => void;
};

export const PhotoStrip = ({
  photos,
  activeId,
  onSelect,
  onFiles,
  onRemove,
}: PhotoStripProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <aside className="flex shrink-0 flex-col lg:w-[150px]">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mb-3 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed py-5 transition-colors",
          drag
            ? "border-primary bg-teal-soft text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/60",
        )}
      >
        <Icons.upload size={22} />
        <span className="text-xs font-semibold">Upload</span>
      </button>

      <div className="flex flex-1 flex-row gap-2.5 overflow-x-auto lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
        {photos.map((p) => {
          const on = p.id === activeId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-xl",
                on && "ring-primary shadow-md ring-[3px]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.name}
                className="block aspect-[3/4] w-20 object-cover lg:w-full"
              />
              {on && (
                <span className="bg-primary absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full">
                  <Icons.check size={12} className="text-white" />
                </span>
              )}
            </button>
          );
        })}
        {photos.length === 0 && (
          <p className="text-muted-foreground mt-2 text-center text-xs">
            No photos yet
          </p>
        )}
      </div>

      {activeId && (
        <Button
          variant="ghost"
          className="bg-coral-soft text-coral mt-2 gap-1.5 hover:opacity-90"
          onClick={() => onRemove(activeId)}
        >
          <Icons.trash size={14} /> Remove
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        hidden
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
    </aside>
  );
};
