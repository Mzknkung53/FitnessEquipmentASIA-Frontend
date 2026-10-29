"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon, PlayIcon } from "@/components/icons";
import { NewBadge, Pictogram } from "@/components/product-bits";
import { QtyStepper } from "@/components/qty-stepper";
import { canBuy, formatMoney, priceLabel, productPrice } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import { showroom } from "@/lib/site";
import type { Product, StockStatus } from "@/lib/types";

export function ProductGallery({ product }: { product: Product }) {
  const gallery = product.gallery.length > 0 ? product.gallery : product.image ? [product.image] : [];
  const [view, setView] = useState(0);
  const img = gallery[view] ?? gallery[0];

  if (!img) {
    return (
      <div className="relative grid aspect-square place-items-center rounded-[18px] bg-stage">
        {product.pictogram ? <Pictogram kind={product.pictogram} className="h-1/2 w-1/2 text-control" /> : <span className="text-muted">ยังไม่มีรูปสินค้า</span>}
        <span className="absolute top-4 left-4 rounded border border-dashed border-control bg-white px-2 py-0.5 text-xs font-semibold text-muted">รอรูปจริง</span>
      </div>
    );
  }

  return (
    <section aria-label="รูปสินค้า" className="flex flex-col gap-3.5 lg:sticky lg:top-[108px]">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[18px] bg-stage">
        <Image src={img.src} alt={img.alt} width={img.width} height={img.height} loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 680px, 100vw" className="blend-stage h-[88%] w-[88%] object-contain" />
        <span className="absolute top-4 left-4 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">
          {product.demo ? "รูปทดสอบ · " : ""}
          {img.alt || `มุมที่ ${view + 1}`}
        </span>
        {product.videoUrl && (
          <a
            href={product.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[13px] font-semibold text-white"
          >
            <PlayIcon size={14} /> ดูวิดีโอ
          </a>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((shot, i) => (
            <button key={`${shot.src}-${i}`} type="button" onClick={() => setView(i)} aria-label={shot.alt || `มุมที่ ${i + 1}`} aria-pressed={view === i} className={`grid aspect-square place-items-center overflow-hidden rounded-[10px] bg-stage ${view === i ? "ring-2 ring-ink" : ""}`}>
              <Image src={shot.src} alt="" width={shot.width} height={shot.height} sizes="160px" className="blend-stage h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

const statusStyle: Record<StockStatus, { text: string; cls: string }> = {
  ready: { text: "พร้อมส่ง", cls: "bg-[#e6f2ea] text-[#1d6b3a]" },
  preorder: { text: "พรีออเดอร์", cls: "bg-[#e7eef9] text-[#1f5aa6]" },
  import: { text: "สั่งผลิต/นำเข้า", cls: "bg-pending-bg text-pending" },
  out: { text: "สินค้าหมด", cls: "bg-[#ecebe8] text-[#57524b]" },
};

export function ProductPurchase({ product }: { product: Product }) {
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
    priceText = priceLabel(summary.mode, summary.amount, currency);
    priceNote = "เลือกสีหรือรุ่นเพื่อดูราคาและสถานะ";
  } else if (variant.priceThb == null) {
    priceText = "สอบถามราคา";
    priceNote = "รุ่นนี้ต้องให้ทีมงานเสนอราคา";
  } else {
    priceText = formatMoney(variant.priceThb, currency);
    priceNote = buyable ? "ราคายังไม่รวม VAT ค่าขนส่งและติดตั้ง" : "ราคายังไม่รวม VAT · ส่งคำขอเพื่อยืนยันราคาและวันส่ง";
  }
  if (currency === "USD" && (variant?.priceThb ?? summary.amount) != null) priceNote = `ราคาโดยประมาณ (USD) · ${priceNote}`;

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
    <section aria-label="ข้อมูลและการสั่งซื้อ" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {product.isNew && <NewBadge label="NEW ARRIVAL" />}
          {status && <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${statusStyle[status].cls}`}><span className="size-2 rounded-full bg-current" />{statusStyle[status].text}</span>}
          {product.setting.includes("commercial") && <span className="rounded-full bg-stage px-3 py-1 text-[13px] font-semibold">ยิมเชิงพาณิชย์</span>}
          {product.setting.includes("home") && <span className="rounded-full bg-stage px-3 py-1 text-[13px] font-semibold">ใช้ที่บ้าน</span>}
          {product.demo && <span className="rounded border border-dashed border-control px-2.5 py-0.5 text-xs font-semibold text-muted">ข้อมูลตัวอย่าง</span>}
        </div>
        <span className="font-mono text-sm text-muted">{variant ? `SKU ${variant.sku}` : `รุ่น ${product.model}`}</span>
        <h1 className="font-display text-[clamp(38px,5vw,52px)] leading-[1.05] font-bold tracking-[-0.02em]">{product.nameEn}</h1>
        <span className="text-xl text-ink-2">{product.nameTh}</span>
        <p className="text-muted">{product.summary}</p>
      </div>

      <div className="flex flex-col gap-1 border-y border-line py-5">
        <span className="font-display text-[44px] leading-[1.1] font-bold tabular-nums">
          {priceText}
          {product.unitNote && variant?.priceThb != null && <span className="ml-2 font-sans text-base font-normal text-muted">{product.unitNote}</span>}
        </span>
        <span className="text-sm text-muted">{priceNote}</span>
        {status && status !== "ready" && <span className="text-sm text-muted">{variant?.leadTime ?? "สอบถามระยะเวลาจัดส่ง"}</span>}
      </div>

      {product.variants.length > 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="pb-3 font-semibold">
            สี / รุ่นย่อย <span className="font-normal text-muted">· {variant?.label ?? "ยังไม่ได้เลือก"}</span>
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
          <QtyStepper value={qty} onChange={setQty} label="จำนวน" />
          <span className="text-sm text-muted">ซื้อหลายเครื่องสำหรับยิม ขอใบเสนอราคาเพื่อพิจารณาส่วนลด</span>
        </div>
        {buyable ? (
          <>
            <button type="button" onClick={addCart} className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg bg-brand font-display text-[19px] font-semibold text-white hover:bg-brand-dark">
              <Icon name="bag" /> เพิ่มลงตะกร้าซื้อ
            </button>
            <button type="button" onClick={addQuote} className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-ink font-display text-[19px] font-semibold hover:bg-ink hover:text-white">
              <Icon name="quote" /> เพิ่มในรายการขอราคา
            </button>
          </>
        ) : (
          <>
            {!variant && product.variants.length > 1 && (
              <button type="button" disabled className="min-h-[60px] cursor-not-allowed rounded-lg bg-[#e3e0db] font-display text-[19px] font-semibold text-muted">
                เลือกสีหรือรุ่นก่อนสั่งซื้อ
              </button>
            )}
            <button type="button" onClick={addQuote} className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg bg-brand font-display text-[19px] font-semibold text-white hover:bg-brand-dark">
              <Icon name="quote" /> เพิ่มในรายการขอราคา
            </button>
            <Link href="/showroom#contact" className="flex min-h-[60px] items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-ink font-display text-[19px] font-semibold hover:bg-ink hover:text-white">
              <Icon name="chat" /> สอบถามสินค้า
            </Link>
          </>
        )}
        {toast && (
          <div role="status" className="flash-in flex items-center justify-between gap-3 rounded-lg bg-night px-4 py-3 text-[15px] text-white">
            <span className="flex items-center gap-2">
              <Icon name="check" className="text-[#3ecf6e]" />
              {toast === "cart" ? "เพิ่มลงตะกร้าซื้อแล้ว" : "เพิ่มในรายการขอราคาแล้ว"}
            </span>
            <Link href={toast === "cart" ? "/checkout" : "/quote"} className="font-semibold underline">
              {toast === "cart" ? "ไปที่ตะกร้า" : "ดูรายการขอราคา"}
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col overflow-hidden rounded-[14px] border border-line">
        <InfoRow icon="ship" title="จัดส่งและติดตั้ง">ให้ทีมงานประเมินค่าขนส่ง · ใส่ที่อยู่ในขั้นตอนถัดไป</InfoRow>
        <InfoRow icon="check" title="การรับประกันรุ่นนี้">
          [ระยะเวลาและส่วนที่ครอบคลุม — รอยืนยัน] · <Link href="/showroom#warranty" className="underline">ดูเงื่อนไข</Link>
        </InfoRow>
        <InfoRow icon="pin" title="ลองเครื่องจริงที่โชว์รูม">
          {showroom.address} · <Link href="/showroom" className="underline">นัดเข้าชม</Link>
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
