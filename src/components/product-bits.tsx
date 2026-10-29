"use client";

import Image from "next/image";
import { useI18n } from "@/components/i18n-provider";
import { BoltIcon, Icon } from "@/components/icons";
import { statusDot } from "@/lib/pricing";
import type { PictogramKind, Product, StockStatus } from "@/lib/types";

// Generic category line drawings. Placeholders only, never a depiction of a real model.
const pictograms: Record<PictogramKind, string> = {
  treadmill: "M10 72h68l12-8M10 72v6h70l10-6v-6M80 66L70 24M60 18h20l-3 8H63zM70 36H52",
  bike: "M18 74a12 12 0 1 0 24 0a12 12 0 1 0-24 0M62 74a12 12 0 1 0 24 0a12 12 0 1 0-24 0M30 74l18-30h20l6 30M48 44l-6-14h-8M62 44l6-20h10",
  rack: "M22 84V12M78 84V12M14 84h72M22 20h56M22 50h10M68 50h10M10 40h80M10 34v12M90 34v12",
  bench: "M14 54h60l12-22M24 54v26M66 54v26M16 80h16M58 80h16",
  dumbbell: "M18 36v28M26 30v40M74 30v40M82 36v28M26 50h48",
  plate: "M14 50a36 36 0 1 0 72 0a36 36 0 1 0-72 0M42 50a8 8 0 1 0 16 0a8 8 0 1 0-16 0M26 50a24 24 0 1 0 48 0a24 24 0 1 0-48 0",
  machine: "M18 86V14h18v72M36 24h40l6 10M82 34v34M60 68h30M56 68l-8 18M14 86h46",
  rower: "M10 72h80M14 62a10 10 0 1 0 20 0a10 10 0 1 0-20 0M84 72V44M40 64h20v8M70 52l14-8",
  kettlebell: "M36 40a14 14 0 0 1 28 0M28 62a22 22 0 1 0 44 0a22 22 0 1 0-44 0M36 40h28",
  flooring: "M10 64l40-18 40 18-40 18zM10 64v8l40 18 40-18v-8M30 55l40 18",
};

export function Pictogram({ kind, className = "" }: { kind: PictogramKind; className?: string }) {
  const { t } = useI18n();
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={t.common.illustrationLabel} className={className}>
      <path d={pictograms[kind]} />
    </svg>
  );
}

export function NewBadge({ label = "NEW" }: { label?: string }) {
  return (
    <span className="badge-new">
      <BoltIcon />
      {label}
    </span>
  );
}

export function StatusChip({ status, className = "" }: { status: StockStatus; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,.08)] ${className}`}>
      <span className={`size-2 rounded-full ${statusDot[status]}`} />
      {t.status[status]}
    </span>
  );
}

export function DemoTag({ children, dark = false }: { children?: React.ReactNode; dark?: boolean }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex rounded border border-dashed px-2 py-0.5 text-xs font-semibold ${dark ? "border-[#5a544d] text-muted-night" : "border-control bg-white text-muted"}`}>
      {children ?? t.common.demoData}
    </span>
  );
}

/** Product photo on the showroom stage, or a labelled placeholder when no photo exists yet. */
export function ProductMedia({ product, sizes, priority = false, className = "w-[86%] h-[86%]" }: { product: Product; sizes: string; priority?: boolean; className?: string }) {
  const { t } = useI18n();
  if (product.image) {
    return (
      <Image
        src={product.image.src}
        alt={product.image.alt}
        width={product.image.width}
        height={product.image.height}
        sizes={sizes}
        preload={priority}
        className={`blend-stage object-contain ${className}`}
      />
    );
  }
  if (product.pictogram) {
    return (
      <>
        <Pictogram kind={product.pictogram} className="h-[52%] w-[52%] text-control" />
        <span className="absolute bottom-3 left-3 rounded border border-dashed border-control bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">{t.common.illustration}</span>
      </>
    );
  }
  return (
    <span className="flex flex-col items-center gap-1.5 text-sm text-muted">
      <Icon name="image" />
      {t.common.noImage}
    </span>
  );
}
