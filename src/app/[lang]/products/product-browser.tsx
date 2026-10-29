"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ProductCard } from "@/components/product-card";
import { SelectMenu } from "@/components/select-menu";
import { categoryName } from "@/lib/i18n/names";
import { productPrice, productStatus, statusDot } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import type { Category, Product, StockStatus } from "@/lib/types";

type Sort = "new" | "picks" | "price";
const ALL_STATUSES: StockStatus[] = ["ready", "preorder", "import", "out"];

export function ProductBrowser({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { lang, t, href } = useI18n();
  const copy = t.products;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { currency } = useShop();
  const cat = params.get("cat") ?? "all";

  const [statuses, setStatuses] = useState<StockStatus[]>(ALL_STATUSES);
  const [pricedOnly, setPricedOnly] = useState(false);
  const [setting, setSetting] = useState<"all" | "home" | "commercial">("all");
  const [sort, setSort] = useState<Sort>("new");

  const pickCat = (id: string) => router.replace(id === "all" ? pathname : `${pathname}?cat=${id}`, { scroll: false });

  const items = useMemo(() => {
    let list = products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        statuses.includes(productStatus(p)) &&
        (!pricedOnly || productPrice(p).mode !== "ask") &&
        (setting === "all" || p.setting.includes(setting)),
    );
    if (sort === "new") list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === "picks") list = [...list].sort((a, b) => a.curatedRank - b.curatedRank);
    // Unknown prices sort last; they are never treated as zero.
    if (sort === "price") list = [...list].sort((a, b) => (productPrice(a).amount ?? Infinity) - (productPrice(b).amount ?? Infinity));
    return list;
  }, [products, cat, statuses, pricedOnly, setting, sort]);

  const current = categories.find((c) => c.id === cat);
  const title = cat === "all" ? copy.allProducts : current ? categoryName(current, lang, t) : copy.fallbackTitle;
  const reset = () => {
    setStatuses(ALL_STATUSES);
    setPricedOnly(false);
    setSetting("all");
    pickCat("all");
  };

  return (
    <>
      <section className="relative overflow-hidden bg-stage">
        <span aria-hidden="true" className="pointer-events-none absolute -right-8 -bottom-[60px] font-display text-[clamp(100px,16vw,220px)] leading-none font-extrabold whitespace-nowrap text-[#e7e5e1]">
          EQUIPMENT
        </span>
        <div className="wrap relative flex flex-col gap-6 pb-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-[clamp(44px,7vw,72px)] leading-none font-bold tracking-[-0.025em]">
              {title}
              <span className="text-brand">.</span>
            </h1>
            <span className="font-display text-xl" aria-live="polite">
              <span className="hollow-thin text-[56px] leading-none font-bold text-ink">{String(items.length).padStart(2, "0")}</span> {t.common.items}
            </span>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-8" role="group" aria-label={copy.pickCategory}>
            {[{ id: "all", name: copy.all }, ...categories.map((c) => ({ id: c.id, name: categoryName(c, lang, t) }))].map((c, i) => {
              const on = cat === c.id;
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => pickCat(c.id)} className={`flex min-h-[88px] w-[136px] shrink-0 flex-col justify-between gap-3 rounded-md px-4 py-3.5 text-left text-white transition-colors sm:min-h-[104px] sm:w-auto ${on ? "bg-brand" : "bg-night hover:bg-[#2a2724]"}`}>
                  <span className="font-mono text-xs opacity-70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[17px] leading-tight font-semibold">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="wrap flex flex-wrap items-start gap-10 pt-10 pb-24">
        <aside aria-label={copy.filters} className="flex max-w-full flex-[1_1_240px] flex-col gap-7 lg:sticky lg:top-[108px]">
          <Filter title={copy.stockStatus}>
            {ALL_STATUSES.map((s) => (
              <label key={s} className="flex min-h-[42px] cursor-pointer items-center gap-3 text-[15px]">
                <input type="checkbox" className="size-5 accent-ink" checked={statuses.includes(s)} onChange={() => setStatuses(statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s])} />
                <span className={`size-2 rounded-full ${statusDot[s]}`} />
                {t.status[s]}
              </label>
            ))}
          </Filter>
          <Filter title={copy.price}>
            <label className="flex min-h-[42px] cursor-pointer items-center gap-3 text-[15px]">
              <input type="checkbox" className="size-5 accent-ink" checked={pricedOnly} onChange={() => setPricedOnly(!pricedOnly)} />
              {copy.pricedOnly}
            </label>
          </Filter>
          <Filter title={copy.suitableFor}>
            {(
              [
                ["all", copy.all],
                ["home", t.setting.home],
                ["commercial", t.setting.commercial],
              ] as const
            ).map(([v, l]) => (
              <label key={v} className="flex min-h-[42px] cursor-pointer items-center gap-3 text-[15px]">
                <input type="radio" name="setting" className="size-5 accent-ink" checked={setting === v} onChange={() => setSetting(v)} />
                {l}
              </label>
            ))}
          </Filter>
          <Link href={href("/quote")} className="flex flex-col gap-2 rounded-xl bg-night p-[22px] text-white">
            <span className="eyebrow text-brand">Gym projects</span>
            <span className="font-display text-[22px] leading-tight font-semibold">{copy.gymBoxTitle}</span>
            <span className="text-sm text-muted-night">{copy.gymBoxBody}</span>
            <span className="pt-1 font-semibold">{copy.gymBoxLink}</span>
          </Link>
        </aside>

        <section aria-label={copy.list} className="flex min-w-0 flex-[999_1_640px] flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full bg-stage p-1" role="group" aria-label={copy.currency}>
              {(
                [
                  ["THB", "฿ THB"],
                  ["USD", copy.usdApprox],
                ] as const
              ).map(([c, l]) => (
                <button key={c} type="button" aria-pressed={currency === c} onClick={() => shop.setCurrency(c)} className={`min-h-10 rounded-full px-3.5 text-sm font-semibold ${currency === c ? "bg-ink text-white" : ""}`}>
                  {l}
                </button>
              ))}
            </div>
            <SelectMenu
              label={t.sort.label}
              value={sort}
              onChange={setSort}
              options={
                [
                  ["new", t.sort.new],
                  ["picks", t.sort.picks],
                  ["price", t.sort.price],
                ] as const
              }
            />
          </div>

          {items.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3.5 rounded-2xl bg-stage px-6 py-[72px] text-center">
              <span className="font-display text-[32px] font-bold">{copy.emptyTitle}</span>
              <span className="max-w-[440px] text-muted">{copy.emptyBody}</span>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button type="button" onClick={reset} className="min-h-[46px] rounded-md bg-ink px-6 font-semibold text-white">
                  {copy.clearFilters}
                </button>
                <Link href={href("/quote")} className="grid min-h-[46px] place-items-center rounded-md border-[1.5px] border-ink bg-white px-6 font-semibold">
                  {copy.ask}
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Filter({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col border-t border-line pt-5 first:border-0 first:pt-0">
      <legend className="float-left w-full pb-2.5 font-display text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
