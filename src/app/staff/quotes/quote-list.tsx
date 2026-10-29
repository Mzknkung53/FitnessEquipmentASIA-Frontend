"use client";

import Link from "next/link";
import { useState } from "react";
import { quoteStatusCls, type QuoteStatus } from "@/app/staff/quotes/quote-meta";
import { useStaffI18n } from "@/app/staff/staff-i18n";
import { fmt } from "@/lib/i18n/config";
import { Icon } from "@/components/icons";

export type QuoteRow = {
  id: string;
  reference: string;
  status: QuoteStatus;
  createdAt: string;
  who: string;
  where: string;
  items: number;
  attachments: number;
  mine: boolean;
  amount: string;
  quoted: boolean;
  search: string;
};

const tabs: { id: "todo" | "quoted" | "won" | "closed" | "all"; statuses: QuoteStatus[] }[] = [
  { id: "todo", statuses: ["new", "reviewing"] },
  { id: "quoted", statuses: ["quoted"] },
  { id: "won", statuses: ["won"] },
  { id: "closed", statuses: ["lost", "cancelled"] },
  { id: "all", statuses: ["new", "reviewing", "quoted", "won", "lost", "cancelled"] },
];

export function QuoteList({ rows }: { rows: QuoteRow[] }) {
  const { t } = useStaffI18n();
  const tq = t.quotes;
  const [tab, setTab] = useState("todo");
  const [query, setQuery] = useState("");
  const active = tabs.find((x) => x.id === tab)!;
  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => active.statuses.includes(r.status) && (!q || r.search.includes(q)));

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#26231f] bg-night-2 p-8">
        <p className="text-lg font-semibold">{tq.emptyTitle}</p>
        <p className="text-muted-night">{tq.emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label={tq.statusGroup} className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((x) => {
          const count = rows.filter((r) => x.statuses.includes(r.status)).length;
          const selected = x.id === tab;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(x.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                selected ? "border-white bg-white text-ink" : "border-[#3d3934] text-muted-night hover:text-white"
              }`}
            >
              {tq.tabs[x.id]}
              <span className={`tabular-nums ${selected ? "text-ink/60" : ""}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <label className="relative">
        <span className="sr-only">{tq.search}</span>
        <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-night" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tq.searchPlaceholder}
          className="min-h-12 w-full rounded-lg border border-[#3d3934] bg-[#151311] pr-4 pl-11 text-[15px] text-white placeholder:text-muted-night"
        />
      </label>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-[#26231f] bg-night-2 p-6 text-muted-night">{tq.noneInTab}</p>
      ) : (
        <ul className="divide-y divide-[#26231f] overflow-hidden rounded-2xl border border-[#26231f] bg-night-2">
          {shown.map((r) => (
            <li key={r.id} className="stagger-item">
              <Link href={`/staff/quotes/${r.id}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[#1a1816]">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-muted-night">{r.reference}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${quoteStatusCls[r.status]}`}>{t.quoteStatus[r.status]}</span>
                    {r.mine && <span className="text-xs text-muted-night">{tq.mine}</span>}
                  </span>
                  <span className="truncate font-semibold">{r.who}</span>
                  <span className="truncate text-sm text-muted-night">
                    {r.where} · {r.items > 0 ? fmt(tq.itemCount, { n: r.items }) : tq.noItems}
                    {r.attachments > 0 && ` · ${fmt(tq.attachmentCount, { n: r.attachments })}`} · {r.createdAt}
                  </span>
                </div>
                <span className={`shrink-0 text-right text-sm tabular-nums ${r.quoted ? "font-semibold text-white" : "text-muted-night"}`}>{r.amount}</span>
                <Icon name="arrow" size={16} className="hidden shrink-0 text-muted-night sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
