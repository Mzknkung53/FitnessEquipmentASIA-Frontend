import type { SVGProps } from "react";

const paths = {
  check: "M4 10.5l4 4 8-9",
  clock: "M10 3a7 7 0 1 0 0 14a7 7 0 1 0 0-14M10 6.5V10l2.5 2",
  ship: "M3 6h9v8H3zM12 9h3l2 2.5V14h-5M6 16.5a1.5 1.5 0 1 0 0-.01M14 16.5a1.5 1.5 0 1 0 0-.01",
  plus: "M10 4v12M4 10h12",
  minus: "M5 10h10",
  quote: "M5 3h7l3 3v11H5zM12 3v3h3M8 10h5M8 13h5",
  chat: "M4 5h12v8H9l-4 3v-3H4z",
  alert: "M10 3l7.5 13h-15zM10 8v4M10 14.2v.3",
  image: "M3 4h14v12H3zM3 13l4-4 3 3 2-2 5 5M13 7.5a1 1 0 1 0 0-.01",
  x: "M5 5l10 10M15 5L5 15",
  arrow: "M4 10h12M11 5l5 5-5 5",
  arrowLeft: "M16 10H4M9 5l-5 5 5 5",
  arrowUpRight: "M6 14L14 6M7 6h7v7",
  search: "M9 3.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11M13 13l4 4",
  bag: "M5 7h10l-1 10H6zM7.5 7V5.5a2.5 2.5 0 0 1 5 0V7",
  menu: "M3 6h14M3 10h14M3 14h14",
  qr: "M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h2v2h-2zM15 15h2v2h-2z",
  pin: "M10 18s-5-4.6-5-8.3a5 5 0 0 1 10 0C15 13.4 10 18 10 18zM10 8.2a1.6 1.6 0 1 0 0 3.2a1.6 1.6 0 1 0 0-3.2",
  lock: "M6 9V6.5a4 4 0 0 1 8 0V9M4.5 9h11v8h-11z",
  scan: "M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4M6 10h8",
  home: "M3 18V8l7-5 7 5v10M8 18v-6h4v6",
  chevron: "M5 7.5l5 5 5-5",
  wrench: "M12.5 3a4 4 0 0 0-3.8 5.2L3 14l3 3 5.8-5.7A4 4 0 0 0 17 7.5l-2.4 2.4-2.5-2.5L14.5 5A4 4 0 0 0 12.5 3z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18, strokeWidth = 1.8, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={paths[name]} />
    </svg>
  );
}

export function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v11l9-5.5z" />
    </svg>
  );
}

export function BoltIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M11 1L3 12h6l-1 7 8-11h-6z" />
    </svg>
  );
}
