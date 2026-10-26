"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Pictogram, StatusChip } from "@/components/product-bits";
import { QtyStepper } from "@/components/qty-stepper";
import { formatMoney } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import { destinationCountries } from "@/lib/site";
import type { ContactMethod, Product } from "@/lib/types";

const methods: { id: ContactMethod; label: string; field: string }[] = [
  { id: "line", label: "LINE", field: "LINE ID" },
  { id: "wechat", label: "WeChat", field: "WeChat ID" },
  { id: "whatsapp", label: "WhatsApp", field: "หมายเลข WhatsApp" },
  { id: "phone", label: "โทรศัพท์", field: "เบอร์โทรศัพท์" },
  { id: "email", label: "อีเมล", field: "อีเมล" },
];

const input = "min-h-[52px] w-full rounded-lg border border-control bg-white px-3.5 text-base font-normal";

export function QuoteClient({ products }: { products: Product[] }) {
  const { quote, currency, ready } = useShop();
  const params = useSearchParams();
  const [method, setMethod] = useState<ContactMethod>("line");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState(() => {
    // Prefill from the "เริ่มวางแผนยิมของคุณ" form on the home page.
    const parts = [params.get("space"), params.get("area") && `พื้นที่ ${params.get("area")} ตร.ม.`, params.get("budget") && `งบประมาณ ${params.get("budget")}`].filter(Boolean);
    return parts.join(" · ");
  });
  const [tried, setTried] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);

  const lines = quote
    .map((l) => {
      const product = products.find((p) => p.slug === l.slug);
      const variant = product?.variants.find((v) => v.sku === l.sku);
      return product && variant ? { ...l, product, variant } : null;
    })
    .filter((l) => l !== null);

  const priced = lines.filter((l) => l.variant.priceThb != null);
  const subtotal = priced.reduce((s, l) => s + (l.variant.priceThb ?? 0) * l.qty, 0);
  const m = methods.find((x) => x.id === method)!;
  const errors = {
    name: tried && !name.trim(),
    contact: tried && !contact.trim(),
    city: tried && !city.trim(),
  };
  const errorCount = Object.values(errors).filter(Boolean).length;
  const advisoryOnly = lines.length === 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !city.trim()) {
      setTried(true);
      return;
    }
    // Prototype: nothing is sent. The backend will create the request, notify staff
    // and return the real reference. It must not charge money or reserve stock.
    setSentRef(`Q-DEMO-${String(lines.length).padStart(2, "0")}${name.trim().length}`);
    shop.clearQuote();
  };

  if (!ready) return <div className="wrap min-h-[70vh] py-24 text-muted" aria-busy="true">กำลังโหลดรายการขอราคา…</div>;

  if (sentRef) {
    return (
      <section className="bg-night text-white">
        <div className="wrap flex max-w-[880px] flex-col gap-7 pt-24 pb-[120px]">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#16261c] px-3.5 py-1.5 font-semibold text-[#6cc28d]">
            <Icon name="check" /> ได้รับคำขอแล้ว
          </span>
          <h1 className="font-display text-[clamp(40px,6vw,64px)] leading-[1.05] font-bold tracking-[-0.02em]">
            ขอบคุณครับ
            <br />
            <span className="hollow text-white">ทีมงานได้รับคำขอแล้ว</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-night">เลขอ้างอิง</span>
            <span className="rounded-md bg-[#1f1d1a] px-3.5 py-1.5 font-mono text-xl">{sentRef}</span>
            <span className="rounded border border-dashed border-[#5a544d] px-2 py-0.5 text-xs text-muted-night">ต้นแบบ · ยังไม่ได้ส่งจริง</span>
          </div>
          <ol className="flex flex-col border-b border-night-line">
            {["ทีมงานตรวจสอบสินค้า สต็อก ค่าขนส่ง ส่วนลด และการติดตั้ง", `ติดต่อกลับทาง ${m.label} เพื่อยืนยันรายละเอียด`, "ส่งใบเสนอราคาฉบับสุดท้าย ก่อนมีการชำระเงินใด ๆ"].map((t, i) => (
              <li key={t} className="flex gap-5 border-t border-night-line py-[18px]">
                <span className="w-10 font-display text-[22px] font-bold text-brand">0{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <span className="text-muted-night">ยังไม่มีการเรียกเก็บเงินหรือจองสินค้า · ระยะเวลาตอบกลับ: [รอยืนยัน]</span>
          <Link href="/products" className="inline-flex min-h-14 items-center self-start rounded-md bg-white px-7 font-display text-lg font-semibold text-ink">
            กลับไปเลือกสินค้า
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-stage">
        <div className="wrap flex flex-wrap items-end justify-between gap-6 pt-12 pb-10">
          <div className="flex max-w-[760px] flex-col gap-3">
            <span className="eyebrow text-brand">Quote request</span>
            <h1 className="font-display text-[clamp(44px,7vw,72px)] leading-none font-bold tracking-[-0.025em]">
              รายการขอราคา<span className="text-brand">.</span>
            </h1>
            <p className="text-lg text-ink-2">รวมสินค้าทั้งที่มีราคาและยังไม่มีราคาในคำขอเดียว ทีมงานตรวจสอบสต็อก ค่าขนส่ง ส่วนลด และการติดตั้งก่อนส่งใบเสนอราคา</p>
          </div>
          <span className="font-display text-xl">
            <span className="hollow-thin text-[64px] leading-none font-bold text-ink">{String(lines.length).padStart(2, "0")}</span> รายการ
          </span>
        </div>
      </section>

      <form onSubmit={submit} noValidate className="wrap flex flex-wrap items-start gap-10 pt-12 pb-24">
        <div className="flex min-w-0 flex-[999_1_620px] flex-col gap-14">
          <section aria-label="สินค้าในรายการ" className="flex flex-col border-t-2 border-ink">
            {advisoryOnly && (
              <div className="flex flex-col gap-3 border-b border-line py-8">
                <span className="font-display text-2xl font-semibold">ยังไม่มีสินค้าในรายการ</span>
                <span className="text-muted">ส่งคำขอได้เลยโดยบอกขนาดพื้นที่และงบประมาณ ทีมงานจะช่วยจัดชุดอุปกรณ์ให้ หรือ <Link href="/products" className="font-semibold text-ink underline">เลือกสินค้าก่อน</Link></span>
              </div>
            )}
            {lines.map((l) => (
              <div key={l.sku} className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-6 gap-y-4 border-b border-line py-6 sm:grid-cols-[132px_minmax(0,1fr)_auto]">
                <Link href={`/products/${l.slug}?v=${l.sku}`} className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-stage">
                  {l.product.image ? (
                    <Image src={l.product.image.src} alt={l.product.image.alt} width={l.product.image.width} height={l.product.image.height} sizes="132px" className="blend-stage h-[88%] w-[88%] object-contain" />
                  ) : l.product.pictogram ? (
                    <Pictogram kind={l.product.pictogram} className="w-3/5 text-control" />
                  ) : (
                    <Icon name="image" className="text-muted" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2.5 text-[13px]">
                    <span className="font-mono text-muted">{l.sku}</span>
                    <StatusChip status={l.variant.status} className="!px-0 !shadow-none" />
                  </span>
                  <Link href={`/products/${l.slug}?v=${l.sku}`} className="font-display text-[22px] leading-tight font-semibold hover:underline">
                    {l.product.nameEn}
                  </Link>
                  <span className="text-sm text-muted">{l.variant.label}</span>
                  <label className="flex max-w-[440px] flex-col gap-1 pt-1 text-[13px] text-muted">
                    หมายเหตุ (ไม่บังคับ)
                    <input value={l.note ?? ""} onChange={(e) => shop.setQuoteNote(l.sku, e.target.value)} placeholder="เช่น ต้องการสีอื่น หรือขนาดพิเศษ" className="min-h-[42px] rounded-lg border border-control px-3 text-sm text-ink" />
                  </label>
                </div>
                <div className="col-span-2 flex flex-wrap items-center justify-between gap-2.5 sm:col-span-1 sm:min-w-[180px] sm:flex-col sm:items-end">
                  {l.variant.priceThb != null ? (
                    <span className="flex flex-col leading-snug sm:items-end">
                      <span className="font-display text-2xl font-semibold tabular-nums">{formatMoney(l.variant.priceThb * l.qty, currency)}</span>
                      <span className="text-[13px] text-muted">
                        {formatMoney(l.variant.priceThb, currency)} × {l.qty}
                      </span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-pending-bg px-3 py-1 text-sm font-semibold text-pending">รอเสนอราคา</span>
                  )}
                  <QtyStepper value={l.qty} onChange={(n) => shop.setQuoteQty(l.sku, n)} label={`จำนวน ${l.product.nameEn}`} />
                  <button type="button" onClick={() => shop.removeFromQuote(l.sku)} className="min-h-9 text-sm text-muted underline underline-offset-4">
                    นำออก
                  </button>
                </div>
              </div>
            ))}
            <Link href="/products" className="pt-[18px] font-semibold">
              + เพิ่มสินค้าอื่น
            </Link>
          </section>

          {errorCount > 0 && (
            <div role="alert" className="flex items-center gap-2.5 rounded-[10px] bg-[#fde8e9] px-[18px] py-4 font-semibold text-[#c8101a]">
              <Icon name="alert" /> กรอกข้อมูลที่จำเป็นอีก {errorCount} ช่อง เพื่อให้ทีมงานติดต่อกลับได้
            </div>
          )}

          <Section n="01" title="ข้อมูลติดต่อ">
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label="ชื่อผู้ติดต่อ" error={errors.name ? "กรอกชื่อผู้ติดต่อ" : undefined}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={errors.name} className={`${input} ${errors.name ? "border-2 border-[#c8101a]" : ""}`} />
              </Field>
              <Field label="บริษัท / ชื่อยิม" optional>
                <input autoComplete="organization" className={input} />
              </Field>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-2 text-sm font-semibold">ช่องทางที่สะดวกให้ติดต่อกลับ</legend>
              <div className="flex flex-wrap gap-2">
                {methods.map((x) => (
                  <label key={x.id} className={`inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full border px-4 text-[15px] font-medium ${method === x.id ? "border-ink bg-ink text-white" : "border-[#d6d2cb] bg-white"}`}>
                    <input type="radio" name="method" checked={method === x.id} onChange={() => setMethod(x.id)} className="size-[18px] accent-white" />
                    {x.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label={m.field} error={errors.contact ? `กรอก${m.field} เพื่อให้ทีมงานติดต่อกลับได้` : undefined}>
                <input value={contact} onChange={(e) => setContact(e.target.value)} aria-invalid={errors.contact} className={`${input} ${errors.contact ? "border-2 border-[#c8101a]" : ""}`} />
              </Field>
            </div>
          </Section>

          <Section n="02" title="ปลายทางและการติดตั้ง">
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label="ประเทศปลายทาง" hint="ภาษาบนเว็บไม่เกี่ยวกับประเทศปลายทาง">
                <select className={input}>
                  {destinationCountries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="จังหวัด / เมือง" error={errors.city ? "กรอกจังหวัดหรือเมือง เพื่อประเมินค่าขนส่ง" : undefined}>
                <input value={city} onChange={(e) => setCity(e.target.value)} aria-invalid={errors.city} className={`${input} ${errors.city ? "border-2 border-[#c8101a]" : ""}`} />
              </Field>
              <Field label="รหัสไปรษณีย์" optional>
                <input inputMode="numeric" className={input} />
              </Field>
            </div>
            <fieldset className="flex flex-wrap gap-2">
              <legend className="pb-2 text-sm font-semibold">ต้องการให้ติดตั้งหรือไม่</legend>
              {["ต้องการติดตั้ง", "ไม่ต้องการ", "ยังไม่แน่ใจ"].map((t, i) => (
                <label key={t} className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full border border-[#d6d2cb] bg-white px-4 text-[15px] has-[:checked]:border-ink">
                  <input type="radio" name="install" defaultChecked={i === 0} className="size-[18px] accent-ink" />
                  {t}
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col gap-1.5 rounded-xl bg-stage px-[22px] py-5">
              <span className="font-semibold">
                การขนเข้าพื้นที่ <span className="text-sm font-normal text-muted">ช่วยให้ประเมินค่าขนส่งและติดตั้งแม่นขึ้น</span>
              </span>
              <div className="grid gap-x-[18px] md:grid-cols-2">
                {["ติดตั้งชั้น 2 ขึ้นไป", "มีลิฟต์ขนของ", "ต้องขนขึ้นบันได", "รถบรรทุกเข้าถึงจุดขนลงได้"].map((t) => (
                  <label key={t} className="flex min-h-[42px] items-center gap-2.5">
                    <input type="checkbox" className="size-[18px] accent-ink" />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section n="03" title="ข้อมูลเพิ่มเติม" note="(ไม่บังคับ)">
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label="วันที่ต้องการรับสินค้า">
                <input type="date" className={input} />
              </Field>
              <Field label="งบประมาณโดยประมาณ">
                <input placeholder="เช่น 1,500,000 บาท" className={input} />
              </Field>
            </div>
            <Field label="แนบแปลนพื้นที่หรือรูปห้อง" hint="PDF, JPG หรือ PNG">
              <input type="file" accept=".pdf,image/*" className="min-h-16 rounded-[10px] border-[1.5px] border-dashed border-control bg-white p-[18px] text-sm" />
            </Field>
            <Field label="ข้อความถึงทีมงาน">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="เช่น ยิมขนาด 120 ตร.ม. เน้นคาร์ดิโอและเวทฟรี" className={`${input} py-3`} />
            </Field>
          </Section>
        </div>

        <aside aria-label="สรุปคำขอ" className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px] rounded-[18px] bg-night p-6 text-white sm:p-8 lg:sticky lg:top-[108px]">
          <span className="font-display text-[26px] font-bold">สรุปคำขอ</span>
          <div className="flex flex-col">
            <SumRow label={`สินค้าที่มีราคา (${priced.length})`} value={formatMoney(subtotal, currency)} />
            <SumRow label={`สินค้ารอเสนอราคา (${lines.length - priced.length})`} value="รอเสนอราคา" pending />
            <SumRow label="ค่าขนส่ง" value="ให้ทีมงานประเมิน" pending />
            <SumRow label="ค่าติดตั้ง" value="รอประเมิน" pending />
            <SumRow label="ภาษี / อากรนำเข้า" value="รอประเมิน" pending />
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-night">ยอดรวมเบื้องต้น</span>
            <span className="font-display text-[34px] font-bold tabular-nums">{formatMoney(subtotal, currency)}+</span>
          </div>
          <span className="text-[13px] text-muted-night">รวมเฉพาะสินค้าที่มีราคา ยังไม่ใช่ราคาสุดท้าย ส่วนลดสำหรับการซื้อจำนวนมากพิจารณาในใบเสนอราคา</span>
          <button type="submit" className="min-h-[60px] rounded-lg bg-brand font-display text-[19px] font-semibold text-white hover:bg-brand-dark">
            {advisoryOnly ? "ขอคำแนะนำจัดชุดยิม" : "ส่งคำขอใบเสนอราคา"}
          </button>
          <span className="flex gap-2 text-[13px] text-[#d8d3cc]">
            <Icon name="check" className="shrink-0 text-[#3ecf6e]" />
            ไม่มีการเรียกเก็บเงิน ไม่สร้างคำสั่งซื้อ และยังไม่จองสินค้า
          </span>
        </aside>
      </form>
    </>
  );
}

function Section({ n, title, note, children }: { n: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-[18px]">
      <legend className="flex items-baseline gap-3.5 pb-[18px] font-display text-[30px] font-bold tracking-[-0.01em]">
        <span className="text-lg text-brand">{n}</span>
        {title}
        {note && <span className="font-sans text-[15px] font-normal text-muted">{note}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, optional, hint, error, children }: { label: string; optional?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      <span>
        {label} {optional && <span className="font-normal text-muted">(ไม่บังคับ)</span>}
      </span>
      {children}
      {error ? (
        <span className="flex items-center gap-1.5 text-[13px] text-[#c8101a]">
          <Icon name="alert" size={14} /> {error}
        </span>
      ) : (
        hint && <span className="text-[13px] font-normal text-muted">{hint}</span>
      )}
    </label>
  );
}

function SumRow({ label, value, pending = false }: { label: string; value: string; pending?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-night-line py-3 text-[15px]">
      <span>{label}</span>
      <span className={`font-semibold ${pending ? "text-[#e3b25a]" : "tabular-nums"}`}>{value}</span>
    </div>
  );
}
