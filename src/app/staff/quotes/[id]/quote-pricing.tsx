"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveQuotation } from "@/app/staff/quotes/actions";
import { useStaffI18n } from "@/app/staff/staff-i18n";
import { Icon } from "@/components/icons";
import { fmt, localePath } from "@/lib/i18n/config";
import { formatMoney } from "@/lib/pricing";

type Item = {
  id: number;
  sku: string;
  name: string;
  variant: string;
  slug: string;
  qty: number;
  note: string | null;
  listPrice: number | null;
  quotedPrice: number | null;
};

const priceInput = "min-h-11 w-full rounded-lg border border-[#3d3934] bg-[#151311] px-3 text-right text-[15px] tabular-nums text-white placeholder:text-muted-night disabled:opacity-60";

const toNumber = (s: string) => {
  const n = Number(s.replace(/[,\s฿]/g, ""));
  return s.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : null;
};
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Line-by-line pricing (THB excl. VAT), VAT choice and live totals. The database
 * recomputes the totals on save; these are for the staff member to see as they type.
 */
export function QuotePricing({
  quoteId,
  reference,
  customer,
  items,
  vatRate: initialVat,
  totalThb,
  closed,
  quotedAt,
}: {
  quoteId: string;
  reference: string;
  customer: string;
  items: Item[];
  vatRate: number;
  totalThb: string;
  closed: boolean;
  quotedAt: string | null;
}) {
  const { lang, t } = useStaffI18n();
  const p = t.pricing;
  const [prices, setPrices] = useState<Record<number, string>>(() =>
    Object.fromEntries(items.map((i) => [i.id, String(i.quotedPrice ?? i.listPrice ?? "")])),
  );
  const [manualTotal, setManualTotal] = useState(totalThb);
  const [vat, setVat] = useState(initialVat === 0 ? 0 : 7);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const lineTotals = items.map((i) => {
    const p = toNumber(prices[i.id] ?? "");
    return p == null ? null : round2(p * i.qty);
  });
  const missing = items.length > 0 && lineTotals.some((t) => t == null);
  const subtotal = items.length > 0 ? lineTotals.reduce<number>((s, t) => s + (t ?? 0), 0) : (toNumber(manualTotal) ?? 0);
  const vatAmount = round2((subtotal * vat) / 100);
  const grand = round2(subtotal + vatAmount);

  const change = <T,>(fn: (v: T) => void) => (v: T) => {
    setSaved(false);
    fn(v);
  };

  const save = () => {
    setError(null);
    start(async () => {
      const r = await saveQuotation({
        quoteId,
        lines: items.map((i) => ({ id: i.id, price: prices[i.id] ?? "" })),
        vatRate: vat,
        totalThb: items.length === 0 ? manualTotal : undefined,
      });
      if (!r.ok) setError(r.error);
      else setSaved(true);
    });
  };

  // Plain-text summary to paste into LINE / email until PDF quotations exist.
  const summary = () =>
    [
      fmt(p.summaryTitle, { ref: reference }),
      fmt(p.summaryDear, { name: customer }),
      "",
      ...items.map((i, n) => {
        const unit = toNumber(prices[i.id] ?? "");
        return `${n + 1}. ${i.name} (${i.variant}) × ${i.qty}${unit != null ? ` @ ${formatMoney(unit)} = ${formatMoney(round2(unit * i.qty))}` : ""}`;
      }),
      "",
      `${p.subtotal} ${formatMoney(subtotal)}`,
      `VAT ${vat}% ${formatMoney(vatAmount)}`,
      `${p.total} ${formatMoney(grand)}`,
      p.summaryExcludes,
    ].join("\n");

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[#26231f] bg-night-2 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">{p.title}</h2>
        {quotedAt && <span className="text-sm text-muted-night">{fmt(p.lastQuoted, { date: quotedAt })}</span>}
      </div>

      {items.length === 0 ? (
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#d8d3cc]">
          {p.adviceTotal}
          <input value={manualTotal} onChange={(e) => change(setManualTotal)(e.target.value)} disabled={closed} inputMode="decimal" placeholder={p.adviceExample} className={priceInput} />
        </label>
      ) : (
        <ul className="flex flex-col divide-y divide-[#26231f]">
          {items.map((i, n) => (
            <li key={i.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[1fr_130px_110px]">
              <div className="col-start-1 row-start-1 min-w-0">
                <Link href={localePath(lang, `/products/${i.slug}`)} target="_blank" className="font-semibold underline-offset-2 hover:underline">
                  {i.name}
                </Link>
                <p className="text-sm text-muted-night">
                  {i.variant} · <span className="font-mono">{i.sku}</span> · {fmt(p.qty, { n: i.qty })}
                </p>
                <p className="text-xs text-muted-night">{fmt(p.listPrice, { price: i.listPrice != null ? formatMoney(i.listPrice) : p.askPrice })}</p>
                {i.note && <p className="text-sm text-[#e3b25a]">{fmt(p.customerNote, { note: i.note })}</p>}
              </div>
              <label className="col-start-2 row-start-1">
                <span className="sr-only">{fmt(p.unitPriceOf, { name: i.name })}</span>
                <input
                  value={prices[i.id] ?? ""}
                  onChange={(e) => change((v: string) => setPrices((prev) => ({ ...prev, [i.id]: v })))(e.target.value)}
                  disabled={closed}
                  inputMode="decimal"
                  placeholder={p.unitPrice}
                  aria-invalid={lineTotals[n] == null}
                  className={`${priceInput} ${lineTotals[n] == null ? "border-[#7a2a2e]" : ""}`}
                />
              </label>
              <span className="col-span-2 row-start-2 text-right text-sm tabular-nums text-muted-night sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:text-[15px] sm:text-white">
                {lineTotals[n] != null ? formatMoney(lineTotals[n]!) : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <fieldset className="flex flex-wrap gap-2" disabled={closed}>
        <legend className="pb-2 text-sm font-semibold text-[#d8d3cc]">VAT</legend>
        {[
          { v: 7, label: p.vat7 },
          { v: 0, label: p.vat0 },
        ].map((o) => (
          <label key={o.v} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[#3d3934] px-4 text-sm has-[:checked]:border-brand has-[:checked]:bg-[#2a1214]">
            <input type="radio" name="vat" checked={vat === o.v} onChange={() => change(setVat)(o.v)} className="accent-brand" />
            {o.label}
          </label>
        ))}
      </fieldset>

      <dl className="flex flex-col gap-1 border-t border-[#26231f] pt-4 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted-night">{p.subtotal}</dt>
          <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-night">VAT {vat}%</dt>
          <dd className="tabular-nums">{formatMoney(vatAmount)}</dd>
        </div>
        <div className="flex justify-between pt-1 text-xl font-bold">
          <dt>{p.total}</dt>
          <dd className="tabular-nums" data-testid="grand-total">
            {formatMoney(grand)}
          </dd>
        </div>
        <p className="text-xs text-muted-night">{p.excludes}</p>
      </dl>

      {error && (
        <p role="alert" className="rounded-lg bg-[#3a1416] px-4 py-3 text-sm text-[#ff8a8f]">
          {error}
        </p>
      )}
      {closed ? (
        <p className="text-sm text-muted-night">{p.closed}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={pending || missing} className="min-h-12 rounded-lg bg-brand px-6 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {pending ? p.saving : p.save}
          </button>
          {missing && <span className="text-sm text-muted-night">{p.fillAll}</span>}
          {saved && (
            <span role="status" className="flash-in inline-flex items-center gap-1.5 text-sm font-semibold text-[#6cc28d]">
              <Icon name="check" size={16} /> {p.saved}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(summary());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="inline-flex items-center gap-2 self-start text-sm text-muted-night underline-offset-2 hover:text-white hover:underline"
      >
        {copied ? p.copied : p.copy}
      </button>
    </section>
  );
}
