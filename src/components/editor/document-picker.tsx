"use client";

import { useState } from "react";

import { Panel } from "@/components/ui/panel";

import { ExportControls } from "./export-controls";
import { PresetGrid } from "./preset-grid";
import { PresetSearch } from "./preset-search";

/** Right panel: document-type search + preset grid + export controls. */
export const DocumentPicker = () => {
  const [query, setQuery] = useState("");

  return (
    <Panel className="lg:w-[280px]">
      <Panel.Header>
        <span className="font-display text-base font-bold">Document type</span>
        <PresetSearch value={query} onChange={setQuery} />
      </Panel.Header>

      <Panel.Body>
        <PresetGrid query={query} />
      </Panel.Body>

      <Panel.Footer>
        <ExportControls />
      </Panel.Footer>
    </Panel>
  );
};
