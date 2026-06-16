import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Compound layout primitive for the editor's side panels (the `card-surface`
 * column with a header, a scrolling body, and a bordered footer). Use as:
 *
 *   <Panel>
 *     <Panel.Header>…</Panel.Header>
 *     <Panel.Body>…</Panel.Body>
 *     <Panel.Footer>…</Panel.Footer>
 *   </Panel>
 */
const Panel = ({ children, className }: PanelProps) => (
  <aside
    className={cn(
      "card-surface flex shrink-0 flex-col overflow-hidden",
      className,
    )}
  >
    {children}
  </aside>
);

const PanelHeader = ({ children, className }: PanelProps) => (
  <div className={cn("px-4 pt-4 pb-3", className)}>{children}</div>
);

const PanelBody = ({ children, className }: PanelProps) => (
  <div className={cn("flex-1 overflow-y-auto px-4 pb-3", className)}>
    {children}
  </div>
);

const PanelFooter = ({ children, className }: PanelProps) => (
  <div
    className={cn(
      "border-border flex flex-col gap-3 border-t px-4 py-4",
      className,
    )}
  >
    {children}
  </div>
);

Panel.Header = PanelHeader;
Panel.Body = PanelBody;
Panel.Footer = PanelFooter;

export { Panel };
