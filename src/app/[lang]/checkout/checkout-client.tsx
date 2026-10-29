"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Pictogram } from "@/components/product-bits";
import { QtyStepper } from "@/components/qty-stepper";
import { canBuy, formatMoney } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import { branches, destinationCountries } from "@/lib/site";
import type { Product } from "@/lib/types";

const steps = ["ข้อมูลติดต่อและที่อยู่", "การจัดส่ง", "วิธีชำระเงิน", "ตรวจสอบและยืนยัน"];
// Candidate methods only — no payment provider is connected yet.
const payments = [
  { id: "bank", label: "โอนผ่านธนาคาร / พร้อมเพย์", note: "สำหรับลูกค้าในไทย · ทีมงานยืนยันยอดก่อนโอน" },
  { id: "card", label: "บัตรเครดิต / เดบิต", note: "ผู้ให้บริการรับชำระยังไม่ได้เลือก" },
  { id: "deposit", label: "ชำระมัดจำ ส่วนที่เหลือก่อนจัดส่ง", note: "เงื่อนไขมัดจำรอยืนยัน" },
];
const input = "min-h-[52px] w-full rounded-lg border border-control bg-white px-3.5 text-base font-normal";

export function CheckoutClient({ products }: { products: Product[] }) {
  const { cart, quote, currency, ready } = useShop();
  const [step, setStep] = useState(0);
  const [pay, setPay] = useState("bank");
  const [fulfil, setFulfil] = useState<"confirm" | "pickup">("confirm");
  const [placed, setPlaced] = useState(false);

  const lines = cart
    .map((l) => {
      const product = products.find((p) => p.slug === l.slug);
      const variant = product?.variants.find((v) => v.sku === l.sku);
      // Only fixed-price, in-stock variants are eligible for direct checkout.
      return product && variant && canBuy(variant) ? { ...l, product, variant, price: variant.priceThb! } : null;
    })
    .filter((l) => l !== null);
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const quoteCount = quote.length;

  if (!ready) return <div className="wrap min-h-[70vh] py-24 text-muted" aria-busy="true">กำลังโหลดตะกร้า…</div>;

  if (lines.length === 0 && !placed) {
    return (
      <section className="wrap flex flex-col items-center gap-[18px] pt-24 pb-[120px] text-center">
        <span className="hollow font-display text-[120px] leading-none font-bold text-ink">00</span>
        <h1 className="font-display text-[clamp(32px,5vw,44px)] font-bold">ตะกร้ายังว่าง</h1>
        <p className="max-w-[560px] text-lg text-muted">ตะกร้าใช้สำหรับสินค้าราคาแน่นอนที่พร้อมส่ง สินค้าอื่นส่งคำขอใบเสนอราคาได้</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/products" className="inline-flex min-h-14 items-center rounded-md bg-brand px-7 font-display text-lg font-semibold text-white">
            ดูสินค้าทั้งหมด
          </Link>
          {quoteCount > 0 && (
            <Link href="/quote" className="inline-flex min-h-14 items-center rounded-md border-[1.5px] border-ink px-6 font-display text-lg font-medium">
              รายการขอราคา ({quoteCount})
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="wrap flex flex-col gap-10 pt-12 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[clamp(44px,7vw,72px)] leading-none font-bold tracking-[-0.025em]">
          ชำระเงิน<span className="text-brand">.</span>
        </h1>
        <span className="rounded border border-dashed border-control px-2.5 py-1 text-[13px] text-muted">ต้นแบบ · ระบบชำระเงินยังไม่ได้เชื่อมต่อ</span>
      </div>

      <ol aria-label="ขั้นตอน" className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {steps.map((label, i) => {
          const current = i === step;
          const done = i < step;
          return (
            <li key={label}>
              <button type="button" onClick={() => !placed && setStep(i)} aria-current={current ? "step" : undefined} className={`flex w-full items-center gap-3.5 rounded-xl px-[18px] py-4 text-left ${current ? "bg-night text-white" : "bg-stage"}`}>
                <span className={`font-display text-[34px] leading-none font-bold ${current ? "text-brand" : done ? "text-ink" : "hollow-thin text-ink"}`}>0{i + 1}</span>
                <span className="text-[15px] leading-tight font-semibold">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-start gap-10">
        <section className="flex min-w-0 flex-[999_1_560px] flex-col gap-[22px]">
          {step === 0 && (
            <>
              <h2 className="font-display text-[32px] font-bold">ข้อมูลติดต่อและที่อยู่จัดส่ง</h2>
              <div className="grid gap-[18px] md:grid-cols-2">
                <Labeled label="ชื่อ-นามสกุล"><input autoComplete="name" className={input} /></Labeled>
                <Labeled label="เบอร์โทรศัพท์"><input type="tel" autoComplete="tel" className={input} /></Labeled>
                <Labeled label="อีเมล" optional><input type="email" autoComplete="email" className={input} /></Labeled>
                <Labeled label="ประเทศปลายทาง">
                  <select className={input}>{destinationCountries.slice(0, 4).map((c) => <option key={c}>{c}</option>)}</select>
                </Labeled>
              </div>
              <Labeled label="ที่อยู่จัดส่ง"><textarea rows={3} autoComplete="street-address" className={`${input} py-3`} /></Labeled>
              <div className="grid gap-[18px] md:grid-cols-2">
                <Labeled label="จังหวัด / เมือง"><input className={input} /></Labeled>
                <Labeled label="รหัสไปรษณีย์"><input inputMode="numeric" autoComplete="postal-code" className={input} /></Labeled>
              </div>
              <label className="flex items-center gap-2.5"><input type="checkbox" className="size-5 accent-ink" />ต้องการใบกำกับภาษีในนามบริษัท</label>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="font-display text-[32px] font-bold">การจัดส่งและติดตั้ง</h2>
              <div className="flex items-center gap-2.5 rounded-xl bg-pending-bg px-[18px] py-4 text-pending">
                <Icon name="clock" />
                <span><strong>ให้ทีมงานประเมินค่าขนส่ง</strong> — ยังไม่มีอัตราอัตโนมัติสำหรับที่อยู่นี้</span>
              </div>
              <Choice checked={fulfil === "confirm"} onChange={() => setFulfil("confirm")} name="ful" title="ให้ทีมงานยืนยันค่าขนส่งก่อน แล้วค่อยชำระ" note="เราส่งยอดรวมทั้งหมดให้ตรวจสอบ ยังไม่มีการตัดเงิน" />
              <Choice checked={fulfil === "pickup"} onChange={() => setFulfil("pickup")} name="ful" title="รับสินค้าเองที่โชว์รูม" note={`${branches.map((b) => b.address.th).join(" / ")} · ทีมงานนัดวันรับสินค้า`} />
              <label className="flex items-center gap-2.5"><input type="checkbox" className="size-5 accent-ink" />ต้องการบริการติดตั้ง (แจ้งค่าบริการก่อนยืนยัน)</label>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="font-display text-[32px] font-bold">วิธีชำระเงิน</h2>
              {payments.map((p) => (
                <Choice key={p.id} checked={pay === p.id} onChange={() => setPay(p.id)} name="pay" title={p.label} note={p.note} tag="ยังไม่ได้เชื่อมต่อ" />
              ))}
              <span className="text-sm text-muted">วิธีชำระเงินที่ใช้ได้ขึ้นกับประเทศปลายทาง</span>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="font-display text-[32px] font-bold">ตรวจสอบและยืนยัน</h2>
              <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-xl bg-stage p-6">
                <dt className="text-muted">การจัดส่ง</dt>
                <dd>{fulfil === "confirm" ? "ทีมงานยืนยันค่าขนส่งก่อนชำระ" : "รับเองที่โชว์รูม"}</dd>
                <dt className="text-muted">ชำระเงิน</dt>
                <dd>{payments.find((p) => p.id === pay)?.label}</dd>
              </dl>
              {placed && (
                <div role="status" className="flex flex-col gap-1 rounded-xl bg-night px-5 py-[18px] text-white">
                  <span className="flex items-center gap-2 font-semibold"><Icon name="check" className="text-[#3ecf6e]" />ส่งคำสั่งซื้อแล้ว (จำลอง)</span>
                  <span className="text-sm text-muted-night">ทีมงานจะยืนยันค่าขนส่งและส่งช่องทางชำระเงินให้ ยังไม่มีการตัดเงิน</span>
                </div>
              )}
            </>
          )}
          <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-5">
            <button type="button" disabled={step === 0 || placed} onClick={() => setStep(step - 1)} className="min-h-[58px] px-2 font-display text-lg font-semibold underline underline-offset-4 disabled:opacity-30">
              ย้อนกลับ
            </button>
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="min-h-[58px] rounded-lg bg-ink px-[30px] font-display text-lg font-semibold text-white">
                ถัดไป →
              </button>
            ) : (
              <button type="button" disabled={placed} onClick={() => setPlaced(true)} className="min-h-[58px] rounded-lg bg-brand px-[30px] font-display text-lg font-semibold text-white disabled:opacity-50">
                ยืนยันคำสั่งซื้อ
              </button>
            )}
          </div>
        </section>

        <aside aria-label="สรุปคำสั่งซื้อ" className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px] rounded-[18px] bg-night p-6 text-white sm:p-8">
          <span className="font-display text-[26px] font-bold">สรุปคำสั่งซื้อ</span>
          {lines.map((l) => (
            <div key={l.sku} className="flex flex-wrap items-center gap-3.5">
              <span className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-[10px] bg-stage">
                {l.product.image ? <Image src={l.product.image.src} alt="" width={l.product.image.width} height={l.product.image.height} sizes="76px" className="blend-stage h-[90%] w-[90%] object-contain" /> : l.product.pictogram && <Pictogram kind={l.product.pictogram} className="w-3/5 text-control" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-snug">
                <span className="font-semibold">{l.product.nameEn}</span>
                <span className="font-mono text-xs text-muted-night">{l.sku}</span>
              </span>
              <span className="font-semibold tabular-nums">{formatMoney(l.price * l.qty, currency)}</span>
              {!placed && (
                <div className="flex w-full items-center justify-between text-ink">
                  <QtyStepper value={l.qty} onChange={(n) => shop.setCartQty(l.sku, n)} label={`จำนวน ${l.product.nameEn}`} />
                  <button type="button" onClick={() => shop.removeFromCart(l.sku)} className="text-sm text-muted-night underline">นำออก</button>
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col">
            <Row label="ค่าสินค้า" value={formatMoney(subtotal, currency)} />
            <Row label="ค่าขนส่ง" value={fulfil === "pickup" ? "ไม่มี (รับเอง)" : "ให้ทีมงานประเมิน"} pending={fulfil !== "pickup"} />
            <Row label="ค่าติดตั้ง" value="รอประเมิน" pending />
            <Row label="ภาษีมูลค่าเพิ่ม" value="[รอยืนยัน]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-night">ยอดค่าสินค้า</span>
            <span className="font-display text-[34px] font-bold tabular-nums">{formatMoney(subtotal, currency)}</span>
          </div>
          <span className="text-[13px] text-muted-night">ยอดสุดท้ายรวมค่าขนส่งและติดตั้ง แจ้งก่อนตัดเงินทุกครั้ง</span>
          {quoteCount > 0 && (
            <Link href="/quote" className="flex flex-col gap-1 rounded-xl border border-night-line p-4 text-sm">
              <span className="font-semibold">สินค้า {quoteCount} รายการอยู่ในรายการขอราคา</span>
              <span className="text-muted-night">สินค้าที่ยังไม่มีราคาแน่นอนแยกไปขอใบเสนอราคา ไม่ถูกเรียกเก็บเงินรอบนี้ →</span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function Labeled({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      <span>
        {label} {optional && <span className="font-normal text-muted">(ไม่บังคับ)</span>}
      </span>
      {children}
    </label>
  );
}

function Choice({ checked, onChange, name, title, note, tag }: { checked: boolean; onChange: () => void; name: string; title: string; note: string; tag?: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3.5 rounded-xl bg-white p-5 ${checked ? "border-2 border-ink" : "border border-[#d6d2cb]"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1 size-5 shrink-0 accent-ink" />
      <span className="flex flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2 font-semibold">
          {title}
          {tag && <span className="rounded border border-dashed border-control px-2 text-xs font-normal text-muted">{tag}</span>}
        </span>
        <span className="text-sm text-muted">{note}</span>
      </span>
    </label>
  );
}

function Row({ label, value, pending = false }: { label: string; value: string; pending?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-night-line py-3 text-[15px]">
      <span>{label}</span>
      <span className={pending ? "font-semibold text-[#e3b25a]" : "font-semibold tabular-nums"}>{value}</span>
    </div>
  );
}
