"use client";

import Link from "next/link";
import { useState } from "react";
import { quoteStatusMeta, type QuoteStatus } from "@/app/staff/quotes/quote-meta";
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

const tabs: { id: string; label: string; statuses: QuoteStatus[] }[] = [
  { id: "todo", label: "ต้องดำเนินการ", statuses: ["new", "reviewing"] },
  { id: "quoted", label: "ส่งราคาแล้ว", statuses: ["quoted"] },
  { id: "won", label: "ปิดการขายได้", statuses: ["won"] },
  { id: "closed", label: "ไม่สำเร็จ / ยกเลิก", statuses: ["lost", "cancelled"] },
  { id: "all", label: "ทั้งหมด", statuses: ["new", "reviewing", "quoted", "won", "lost", "cancelled"] },
];

export function QuoteList({ rows }: { rows: QuoteRow[] }) {
  const [tab, setTab] = useState("todo");
  const [query, setQuery] = useState("");
  const active = tabs.find((t) => t.id === tab)!;
  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => active.statuses.includes(r.status) && (!q || r.search.includes(q)));

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#26231f] bg-night-2 p-8">
        <p className="text-lg font-semibold">ยังไม่มีใบขอราคา</p>
        <p className="text-muted-night">เมื่อลูกค้าส่งคำขอจากหน้าเว็บ จะขึ้นที่นี่ และมีตัวเลขแจ้งที่แท็บด้านบน</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="สถานะ" className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const count = rows.filter((r) => t.statuses.includes(r.status)).length;
          const selected = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                selected ? "border-white bg-white text-ink" : "border-[#3d3934] text-muted-night hover:text-white"
              }`}
            >
              {t.label}
              <span className={`tabular-nums ${selected ? "text-ink/60" : ""}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <label className="relative">
        <span className="sr-only">ค้นหาใบขอราคา</span>
        <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-night" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาเลขที่ ชื่อลูกค้า บริษัท เบอร์ หรือเมือง"
          className="min-h-12 w-full rounded-lg border border-[#3d3934] bg-[#151311] pr-4 pl-11 text-[15px] text-white placeholder:text-muted-night"
        />
      </label>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-[#26231f] bg-night-2 p-6 text-muted-night">ไม่มีรายการในกลุ่มนี้</p>
      ) : (
        <ul className="divide-y divide-[#26231f] overflow-hidden rounded-2xl border border-[#26231f] bg-night-2">
          {shown.map((r) => (
            <li key={r.id} className="stagger-item">
              <Link href={`/staff/quotes/${r.id}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[#1a1816]">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-muted-night">{r.reference}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${quoteStatusMeta[r.status].cls}`}>{quoteStatusMeta[r.status].label}</span>
                    {r.mine && <span className="text-xs text-muted-night">· ดูแลโดยคุณ</span>}
                  </span>
                  <span className="truncate font-semibold">{r.who}</span>
                  <span className="truncate text-sm text-muted-night">
                    {r.where} · {r.items > 0 ? `${r.items} รายการ` : "ไม่ได้เลือกสินค้า"}
                    {r.attachments > 0 && ` · แนบไฟล์ ${r.attachments}`} · {r.createdAt}
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
