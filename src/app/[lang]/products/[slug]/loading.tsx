"use client";

import { useI18n } from "@/components/i18n-provider";

export default function ProductLoading() {
  const { t } = useI18n();
  return (
    <div className="wrap grid gap-14 pt-12 pb-24 lg:grid-cols-[1.2fr_1fr]" aria-busy="true" aria-label={t.product.loading}>
      <div className="aspect-square animate-pulse rounded-[18px] bg-stage" />
      <div className="flex flex-col gap-4">
        <div className="h-6 w-1/3 animate-pulse rounded bg-stage" />
        <div className="h-14 w-4/5 animate-pulse rounded bg-stage" />
        <div className="h-12 w-1/2 animate-pulse rounded bg-stage" />
        <div className="h-[60px] animate-pulse rounded-lg bg-stage" />
        <div className="h-[60px] animate-pulse rounded-lg bg-stage" />
      </div>
    </div>
  );
}
