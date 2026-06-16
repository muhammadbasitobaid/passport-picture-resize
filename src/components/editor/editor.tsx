"use client";

import { useTheme } from "next-themes";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { ControlBar } from "./control-bar";
import { DocumentPicker } from "./document-picker";
import { PhotoStrip } from "./photo-strip";
import { Stage } from "./stage";
import { StatusBanner } from "./status-banner";

/**
 * Layout shell only. All editor state lives in the Zustand store
 * (`./store`); each panel subscribes to just the slices it needs, so moving a
 * slider re-renders only the panels that read that slice — no prop drilling and
 * no full-tree re-render.
 */
export const Editor = () => {
  const { resolvedTheme, setTheme } = useTheme();

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
        <PhotoStrip />

        <main className="card-surface flex min-w-0 flex-1 flex-col overflow-hidden">
          <Stage />
          <StatusBanner />
          <ControlBar />
        </main>

        <DocumentPicker />
      </div>
    </div>
  );
};
