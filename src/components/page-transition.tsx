import { ViewTransition } from "react";

/**
 * Animates page changes: the old page fades and lifts away, the new one rises in
 * (classes .page-in / .page-out in globals.css). Uses the browser's View Transitions
 * through React; navigations are transitions, so it runs on every link click.
 * default="none" keeps it still during in-page updates (forms, filters, refreshes).
 * Mount it in a template or a page, not a layout: layouts never unmount.
 */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div className={className}>{children}</div>
    </ViewTransition>
  );
}
