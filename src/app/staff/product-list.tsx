"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStaffI18n } from "@/app/staff/staff-i18n";
import { Icon } from "@/components/icons";
import { fmt, localePath } from "@/lib/i18n/config";

export type StaffProductRow = {
  slug: string;
  code: string;
  nameTh: string;
  nameEn: string;
  status: "draft" | "published" | "archived";
  category: string;
  price: string;
  thumb: string | null;
};

const statusCls: Record<StaffProductRow["status"], string> = {
  published: "bg-[#16261c] text-[#6cc28d]",
  draft: "bg-[#262422] text-[#d8d3cc]",
  archived: "bg-[#262422] text-muted-night",
};

export function StaffProductList({ products }: { products: StaffProductRow[] }) {
  const { lang, t } = useStaffI18n();
  const tp = t.products;
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q
    ? products.filter((p) => [p.nameTh, p.nameEn, p.code, p.category].some((s) => s.toLowerCase().includes(q)))
    : products;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#26231f] bg-night-2 p-8">
        <p className="text-lg font-semibold">{tp.emptyTitle}</p>
        <p className="text-muted-night">{tp.emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="relative">
        <span className="sr-only">{tp.search}</span>
        <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-night" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tp.searchPlaceholder}
          className="min-h-12 w-full rounded-lg border border-[#3d3934] bg-[#151311] pr-4 pl-11 text-[15px] text-white placeholder:text-muted-night"
        />
      </label>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-[#26231f] bg-night-2 p-6 text-muted-night">{fmt(tp.noMatch, { q: query })}</p>
      ) : (
        <ul className="divide-y divide-[#26231f] overflow-hidden rounded-2xl border border-[#26231f] bg-night-2">
          {shown.map((p) => (
            <li key={p.slug} className="stagger-item flex items-center gap-4 px-4 py-3">
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#1a1816]">
                {p.thumb ? (
                  <Image src={p.thumb} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <Icon name="image" size={20} className="text-muted-night" />
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{p.nameTh}</span>
                <span className="truncate text-sm text-muted-night">
                  {p.nameEn} · {p.category} · <span className="font-mono">{p.code}</span>
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                <span className="tabular-nums">{p.price}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusCls[p.status]}`}>{tp.status[p.status]}</span>
              </div>
              {p.status === "published" && (
                <Link href={localePath(lang, `/products/${p.slug}`)} target="_blank" aria-label={fmt(tp.viewOnSite, { name: lang === "th" ? p.nameTh : p.nameEn })} className="hidden shrink-0 rounded-lg border border-[#3d3934] p-2.5 text-muted-night hover:border-white hover:text-white sm:inline-flex">
                  <Icon name="arrowUpRight" size={16} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
