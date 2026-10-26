"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { NewBadge, ProductMedia, StatusChip } from "@/components/product-bits";
import { canBuy, priceLabel, productPrice, productStatus } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { currency } = useShop();
  const href = `/products/${product.slug}`;
  const status = productStatus(product);
  const { mode, amount } = productPrice(product);
  const single = product.variants.length === 1 ? product.variants[0] : null;
  const buyable = single != null && canBuy(single);
  const out = status === "out";
  const firstVariant = product.variants[0];

  const addQuote = () => shop.addToQuote({ sku: firstVariant.sku, slug: product.slug, qty: 1 });

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-white transition hover:-translate-y-[3px] hover:shadow-[0_18px_40px_-18px_rgba(22,19,15,.35)]">
      <Link href={href} className="relative grid aspect-square place-items-center overflow-hidden bg-stage" aria-label={product.nameTh}>
        <ProductMedia product={product} sizes="(min-width: 1100px) 400px, (min-width: 640px) 50vw, 100vw" className="h-[86%] w-[86%] transition-transform duration-300 group-hover:scale-[1.04]" />
      </Link>
      <div className="pointer-events-none absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
        {product.isNew && !out && <NewBadge />}
        <StatusChip status={status} />
      </div>
      <button type="button" onClick={addQuote} aria-label={`เพิ่ม ${product.nameEn} ในรายการขอราคา`} className="absolute top-3.5 right-3.5 grid size-10 place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.08)] hover:bg-night hover:text-white">
        <Icon name="plus" />
      </button>
      <div className={`flex flex-1 flex-col gap-1 px-5 pt-[18px] pb-5 ${out ? "opacity-60" : ""}`}>
        <span className="font-mono text-xs text-muted">
          {product.model}
          {product.demo && " · ตัวอย่าง"}
        </span>
        <Link href={href} className="font-display text-xl leading-tight font-semibold hover:underline">
          {product.nameEn}
        </Link>
        <span className="text-sm text-muted">{product.nameTh}</span>
        <span className="pt-1.5 font-display text-[22px] font-semibold tabular-nums">
          {priceLabel(mode, amount, currency)}
          {product.unitNote && mode !== "ask" && <span className="ml-1.5 font-sans text-sm font-normal text-muted">{product.unitNote}</span>}
        </span>
        {currency === "USD" && mode !== "ask" && <span className="text-xs text-muted">ราคาโดยประมาณ (USD)</span>}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          {buyable ? (
            <button type="button" onClick={() => shop.addToCart({ sku: single.sku, slug: product.slug, qty: 1 })} className="min-h-[46px] rounded-md bg-brand text-[15px] font-semibold text-white hover:bg-brand-dark">
              ใส่ตะกร้า
            </button>
          ) : (
            <Link href={href} className="grid min-h-[46px] place-items-center rounded-md bg-brand text-[15px] font-semibold text-white hover:bg-brand-dark">
              ดูสินค้า
            </Link>
          )}
          <button type="button" onClick={addQuote} className="min-h-[46px] rounded-md border-[1.5px] border-ink bg-white text-[15px] font-semibold hover:bg-ink hover:text-white">
            {out ? "สอบถามสินค้า" : "ขอใบเสนอราคา"}
          </button>
        </div>
      </div>
    </article>
  );
}
