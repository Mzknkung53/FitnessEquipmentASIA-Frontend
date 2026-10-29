"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Icon } from "@/components/icons";
import { NewBadge, ProductMedia, StatusChip } from "@/components/product-bits";
import { fmt } from "@/lib/i18n/config";
import { productSubtitle } from "@/lib/i18n/names";
import { canBuy, priceLabel, productPrice, productStatus } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { lang, t, href: to } = useI18n();
  const { currency } = useShop();
  const href = to(`/products/${product.slug}`);
  const subtitle = productSubtitle(product, lang);
  const status = productStatus(product);
  const { mode, amount } = productPrice(product);
  const single = product.variants.length === 1 ? product.variants[0] : null;
  const buyable = single != null && canBuy(single);
  const out = status === "out";
  const firstVariant = product.variants[0];

  // The round + turns into a drawn tick for a moment after adding.
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const addQuote = () => {
    shop.addToQuote({ sku: firstVariant.sku, slug: product.slug, qty: 1 });
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-white transition duration-500 ease-(--ease-spring) hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(22,19,15,.35)]">
      <Link href={href} className="relative grid aspect-square place-items-center overflow-hidden bg-stage" aria-label={product.nameEn}>
        <ProductMedia product={product} sizes="(min-width: 1100px) 400px, (min-width: 640px) 50vw, 100vw" className="h-[86%] w-[86%] transition-transform duration-700 ease-(--ease-spring) group-hover:scale-[1.05]" />
      </Link>
      <div className="pointer-events-none absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
        {product.isNew && !out && <NewBadge />}
        <StatusChip status={status} />
      </div>
      <button type="button" onClick={addQuote} aria-label={fmt(t.card.addToQuote, { name: product.nameEn })} className={`absolute top-3.5 right-3.5 grid size-10 place-items-center rounded-full shadow-[0_1px_2px_rgba(0,0,0,.08)] ${added ? "bg-brand text-white" : "bg-white hover:bg-night hover:text-white"}`}>
        {added ? <Icon key="added" name="check" strokeWidth={2.2} className="tick-draw" /> : <Icon name="plus" />}
      </button>
      <div className={`flex flex-1 flex-col gap-1 px-5 pt-[18px] pb-5 ${out ? "opacity-60" : ""}`}>
        <span className="font-mono text-xs text-muted">
          {product.model}
          {product.demo && ` · ${t.common.sample}`}
        </span>
        <Link href={href} className="font-display text-xl leading-tight font-semibold hover:underline">
          {product.nameEn}
        </Link>
        {subtitle && <span className="text-sm text-muted">{subtitle}</span>}
        <span className="pt-1.5 font-display text-[22px] font-semibold tabular-nums">
          {priceLabel(mode, amount, currency, t.common)}
          {product.unitNote && mode !== "ask" && <span className="ml-1.5 font-sans text-sm font-normal text-muted">{product.unitNote}</span>}
        </span>
        {currency === "USD" && mode !== "ask" && <span className="text-xs text-muted">{t.common.usdApprox}</span>}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          {buyable ? (
            <button type="button" onClick={() => shop.addToCart({ sku: single.sku, slug: product.slug, qty: 1 })} className="min-h-[46px] rounded-md bg-brand text-[15px] font-semibold text-white hover:bg-brand-dark">
              {t.card.addToCart}
            </button>
          ) : (
            <Link href={href} className="grid min-h-[46px] place-items-center rounded-md bg-brand text-[15px] font-semibold text-white hover:bg-brand-dark">
              {t.card.view}
            </Link>
          )}
          <button type="button" onClick={addQuote} className="min-h-[46px] rounded-md border-[1.5px] border-ink bg-white text-[15px] font-semibold hover:bg-ink hover:text-white">
            {out ? t.card.askAbout : t.card.requestQuote}
          </button>
        </div>
      </div>
    </article>
  );
}
