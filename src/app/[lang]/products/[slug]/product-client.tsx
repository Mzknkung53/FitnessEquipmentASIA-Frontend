"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Icon, PlayIcon } from "@/components/icons";
import { NewBadge, Pictogram } from "@/components/product-bits";
import { QtyStepper } from "@/components/qty-stepper";
import { fmt } from "@/lib/i18n/config";
import { productSubtitle } from "@/lib/i18n/names";
import { canBuy, formatMoney, priceLabel, productPrice } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import type { Product, StockStatus } from "@/lib/types";

export function ProductGallery({ product }: { product: Product }) {
  const { t } = useI18n();
  const gallery = product.gallery.length > 0 ? product.gallery : product.image ? [product.image] : [];
  const [view, setView] = useState(0);
  const img = gallery[view] ?? gallery[0];

  if (!img) {
    return (
      <div className="relative grid aspect-square place-items-center rounded-[18px] bg-stage">
        {product.pictogram ? <Pictogram kind={product.pictogram} className="h-1/2 w-1/2 text-control" /> : <span className="text-muted">{t.common.noImage}</span>}
        <span className="absolute top-4 left-4 rounded border border-dashed border-control bg-white px-2 py-0.5 text-xs font-semibold text-muted">{t.product.awaitingPhoto}</span>
      </div>
    );
  }

  return (
    <section aria-label={t.product.photos} className="flex flex-col gap-3.5 lg:sticky lg:top-[108px]">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[18px] bg-stage">
        <Image src={img.src} alt={img.alt} width={img.width} height={img.height} loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 680px, 100vw" className="blend-stage h-[88%] w-[88%] object-contain" />
        <span className="absolute top-4 left-4 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">
          {product.demo ? t.product.testPhoto : ""}
          {img.alt || fmt(t.product.angle, { n: view + 1 })}
        </span>
        {product.videoUrl && (
          <a
            href={product.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[13px] font-semibold text-white"
          >
            <PlayIcon size={14} /> {t.product.watchVideo}
          </a>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((shot, i) => (
            <button key={`${shot.src}-${i}`} type="button" onClick={() => setView(i)} aria-label={shot.alt || fmt(t.product.angle, { n: i + 1 })} aria-pressed={view === i} className={`grid aspect-square place-items-center overflow-hidden rounded-[10px] bg-stage ${view === i ? "ring-2 ring-ink" : ""}`}>
              <Image src={shot.src} alt="" width={shot.width} height={shot.height} sizes="160px" className="blend-stage h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

const statusStyle: Record<StockStatus, string> = {
  ready: "bg-[#e6f2ea] text-[#1d6b3a]",
  preorder: "bg-[#e7eef9] text-[#1f5aa6]",
  import: "bg-pending-bg text-pending",
  out: "bg-[#ecebe8] text-[#57524b]",
};

export function ProductPurchase({ product }: { product: Product }) {
  const { lang, t, href } = useI18n();
  const pt = t.product;
  const subtitle = productSubtitle(product, lang);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { currency } = useShop();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<"cart" | "quote" | null>(null);

  // A variant-specific QR link (?v=SKU) preselects that variant.
  const fromUrl = product.variants.find((x) => x.sku === params.get("v"));
  const variant = fromUrl ?? (product.variants.length === 1 ? product.variants[0] : null);
  const pick = (sku: string) => {
    setToast(null);
    router.replace(`${pathname}?v=${sku}`, { scroll: false });
  };

  const summary = productPrice(product);
  const buyable = variant != null && canBuy(variant);
  const status = variant?.status ?? null;

  let priceText: string;
  let priceNote: string;
  if (!variant) {
    priceText = priceLabel(summary.mode, summary.amount, currency, t.common);
    priceNote = pt.pickVariantForPrice;
  } else if (variant.priceThb == null) {
    priceText = t.common.askPrice;
    priceNote = pt.quoteOnly;
  } else {
    priceText = formatMoney(variant.priceThb, currency);
    priceNote = buyable ? pt.exVatShipping : pt.exVatConfirm;
  }
  if (currency === "USD" && (variant?.priceThb ?? summary.amount) != null) priceNote = `${t.common.usdApprox} · ${priceNote}`;

  const addQuote = () => {
    const v = variant ?? product.variants[0];
    shop.addToQuote({ sku: v.sku, slug: product.slug, qty });
    setToast("quote");
  };
  const addCart = () => {
    if (!variant || !buyable) return;
    shop.addToCart({ sku: variant.sku, slug: product.slug, qty });
    setToast("cart");
  };

  return (
    <section aria-label={pt.purchase} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {product.isNew && <NewBadge label="NEW ARRIVAL" />}
          {status && <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${statusStyle[status]}`}><span className="size-2 rounded-full bg-current" />{t.status[status]}</span>}
          {product.setting.includes("commercial") && <span className="rounded-full bg-stage px-3 py-1 text-[13px] font-semibold">{t.setting.commercial}</span>}
          {product.setting.includes("home") && <span className="rounded-full bg-stage px-3 py-1 text-[13px] font-semibold">{t.setting.home}</span>}
          {product.demo && <span className="rounded border border-dashed border-control px-2.5 py-0.5 text-xs font-semibold text-muted">{t.common.demoData}</span>}
        </div>
        <span className="font-mono text-sm text-muted">{variant ? `SKU ${variant.sku}` : fmt(pt.model, { model: product.model })}</span>
        <h1 className="font-display text-[clamp(38px,5vw,52px)] leading-[1.05] font-bold tracking-[-0.02em]">{product.nameEn}</h1>
        {subtitle && <span className="text-xl text-ink-2">{subtitle}</span>}
        <p className="text-muted">{product.summary}</p>
      </div>

      <div className="flex flex-col gap-1 border-y border-line py-5">
        <span className="font-display text-[44px] leading-[1.1] font-bold tabular-nums">
          {priceText}
          {product.unitNote && variant?.priceThb != null && <span className="ml-2 font-sans text-base font-normal text-muted">{product.unitNote}</span>}
        </span>
        <span className="text-sm text-muted">{priceNote}</span>
        {status && status !== "ready" && <span className="text-sm text-muted">{variant?.leadTime ?? pt.askLeadTime}</span>}
      </div>

      {product.variants.length > 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="pb-3 font-semibold">
            {pt.variant} <span className="font-normal text-muted">· {variant?.label ?? pt.notChosen}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => {
              const on = variant?.sku === v.sku;
              return (
                <button key={v.sku} type="button" aria-pressed={on} onClick={() => pick(v.sku)} className={`flex min-h-[52px] items-center gap-2.5 rounded-full bg-white pr-4 pl-2.5 text-[15px] font-semibold ${on ? "border-2 border-ink" : "border border-[#ccc8c1]"}`}>
                  <span className="size-[30px] rounded-full border border-[#ccc8c1]" style={{ background: v.swatch }} />
                  {v.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <QtyStepper value={qty} onChange={setQty} label={t.common.quantity} />
          <span className="text-sm text-muted">{pt.bulkNote}</span>
        </div>
        {buyable ? (
          <>
            <button type="button" onClick={addCart} className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg bg-brand font-display text-[19px] font-semibold text-white hover:bg-brand-dark">
              <Icon name="bag" /> {pt.addToCart}
            </button>
            <button type="button" onClick={addQuote} className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-ink font-display text-[19px] font-semibold hover:bg-ink hover:text-white">
              {toast === "quote" ? <Icon name="check" className="tick-draw" /> : <Icon name="quote" />} {pt.addToQuote}
            </button>
          </>
        ) : (
          <>
            {!variant && product.variants.length > 1 && (
              <button type="button" disabled className="min-h-[60px] cursor-not-allowed rounded-lg bg-[#e3e0db] font-display text-[19px] font-semibold text-muted">
                {pt.pickVariantFirst}
              </button>
            )}
            <button type="button" onClick={addQuote} className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg bg-brand font-display text-[19px] font-semibold text-white hover:bg-brand-dark">
              {toast === "quote" ? <Icon name="check" className="tick-draw" /> : <Icon name="quote" />} {pt.addToQuote}
            </button>
            <Link href={href("/showroom#contact")} className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-ink font-display text-[19px] font-semibold hover:bg-ink hover:text-white">
              <Icon name="chat" /> {pt.askAbout}
            </Link>
          </>
        )}
        {toast && (
          <div role="status" className="flash-in flex items-center justify-between gap-3 rounded-lg bg-night px-4 py-3 text-[15px] text-white">
            <span className="flex items-center gap-2">
              <Icon name="check" className="tick-draw text-[#3ecf6e]" />
              {toast === "cart" ? pt.addedToCart : pt.addedToQuote}
            </span>
            <Link href={href(toast === "cart" ? "/checkout" : "/quote")} className="font-semibold underline">
              {toast === "cart" ? pt.goToCart : pt.viewQuote}
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col overflow-hidden rounded-[14px] border border-line">
        <InfoRow icon="ship" title={pt.deliveryTitle}>{pt.deliveryBody}</InfoRow>
        <InfoRow icon="check" title={pt.warrantyTitle}>
          {pt.warrantyBody} · <Link href={href("/showroom#warranty")} className="underline">{pt.seeTerms}</Link>
        </InfoRow>
        <InfoRow icon="pin" title={pt.showroomTitle}>
          {t.common.showroomLine} · <Link href={href("/showroom")} className="underline">{pt.bookVisit}</Link>
        </InfoRow>
      </div>
    </section>
  );
}

function InfoRow({ icon, title, children }: { icon: "ship" | "check" | "pin"; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5 border-b border-line px-[18px] py-4 last:border-0">
      <Icon name={icon} className="mt-1 text-brand" />
      <span className="flex flex-col leading-normal">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-muted">{children}</span>
      </span>
    </div>
  );
}
