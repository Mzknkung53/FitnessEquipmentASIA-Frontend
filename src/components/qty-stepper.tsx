"use client";

import { useI18n } from "@/components/i18n-provider";

export function QtyStepper({ value, onChange, label, min = 1, max = 999 }: { value: number; onChange: (n: number) => void; label: string; min?: number; max?: number }) {
  const { t } = useI18n();
  const set = (n: number) => onChange(Math.max(min, Math.min(max, Number.isFinite(n) ? Math.trunc(n) : min)));
  return (
    <div role="group" aria-label={label} className="inline-flex h-11 items-stretch rounded-md border border-control bg-white">
      <button type="button" aria-label={t.common.decrease} disabled={value <= min} onClick={() => set(value - 1)} className="w-11 text-xl disabled:opacity-40">
        −
      </button>
      <input type="text" inputMode="numeric" aria-label={label} value={value} onChange={(e) => set(parseInt(e.target.value || "0", 10))} className="w-12 border-x border-line text-center font-semibold tabular-nums" />
      <button type="button" aria-label={t.common.increase} disabled={value >= max} onClick={() => set(value + 1)} className="w-11 text-xl disabled:opacity-40">
        +
      </button>
    </div>
  );
}
