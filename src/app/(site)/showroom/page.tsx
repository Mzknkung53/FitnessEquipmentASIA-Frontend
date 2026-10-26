import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceForm } from "@/app/(site)/showroom/service-form";
import { Icon, PlayIcon } from "@/components/icons";
import { getProducts } from "@/lib/catalog";
import { contactChannels, showroom } from "@/lib/site";

export const metadata: Metadata = { title: "โชว์รูม ติดต่อ และบริการหลังการขาย" };

const faqs = [
  ["ส่งไปลาว เมียนมา หรือจีนได้ไหม", "ได้ ทีมงานประเมินค่าขนส่ง ภาษีนำเข้า และเงื่อนไขการส่งมอบเป็นรายครั้ง [รอยืนยัน]"],
  ["สินค้าสั่งผลิต/นำเข้าใช้เวลานานเท่าไร", "ขึ้นกับรุ่นและจำนวน ทีมงานแจ้งระยะเวลาในใบเสนอราคา"],
  ["มีส่วนลดเมื่อซื้อจำนวนมากไหม", "พิจารณาเป็นรายคำขอ ส่งรายการผ่านรายการขอราคา"],
  ["ติดตั้งให้ไหม มีค่าใช้จ่ายเท่าไร", "ทีมงานแจ้งค่าติดตั้งตามสินค้าและสถานที่ก่อนยืนยันทุกครั้ง"],
];

export default async function ShowroomPage() {
  const guides = (await getProducts()).filter((p) => p.image);
  return (
    <>
      <section className="relative overflow-hidden bg-stage">
        <span aria-hidden="true" className="hollow pointer-events-none absolute -bottom-[60px] -left-2.5 font-display text-[clamp(120px,20vw,260px)] leading-none font-extrabold whitespace-nowrap text-[#dedbd5]">
          SHOWROOM
        </span>
        <div className="wrap relative grid items-center gap-14 pt-20 pb-[120px] lg:grid-cols-2">
          <div className="flex flex-col gap-[22px]">
            <span className="eyebrow flex items-center gap-3 text-muted">
              <span className="h-[3px] w-8 bg-brand" /> About &amp; showroom
            </span>
            <h1 className="font-display text-[clamp(48px,7vw,80px)] leading-[1.02] font-bold tracking-[-0.025em]">
              มาลองเครื่อง
              <br />
              <span className="hollow text-ink">ของจริง</span>
              <span className="text-brand">.</span>
            </h1>
            <p className="max-w-[520px] text-[19px] text-ink-2">เราเป็นเจ้าของแบรนด์ มีโรงงาน คลังสินค้า และโชว์รูมของเราเอง [ข้อความแนะนำบริษัทจากเจ้าของ]</p>
            <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-2.5">
              <dt className="text-muted">ที่อยู่</dt><dd className="font-semibold">{showroom.address}</dd>
              <dt className="text-muted">เวลาทำการ</dt><dd className="font-semibold">{showroom.hours}</dd>
              <dt className="text-muted">โทร</dt><dd className="font-semibold">{showroom.phone}</dd>
            </dl>
            <div className="flex flex-wrap gap-3">
              <a href="#contact" className="inline-flex min-h-14 items-center rounded-md bg-brand px-7 font-display text-lg font-semibold text-white">นัดเข้าชมโชว์รูม</a>
              <a href="#map" className="inline-flex min-h-14 items-center gap-2 rounded-md border-[1.5px] border-ink px-6 font-display text-lg font-medium">เปิดแผนที่ <Icon name="arrowUpRight" /></a>
            </div>
          </div>
          <div id="map" className="flex aspect-[4/3] flex-col items-center justify-center gap-2.5 rounded-[18px] bg-night text-muted-night">
            <Icon name="image" size={28} />
            <span>[รูปโชว์รูมจริง / แผนที่ — รอข้อมูลจากเจ้าของ]</span>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-night text-white">
        <div className="wrap grid items-start gap-16 py-24 lg:grid-cols-2">
          <div className="flex flex-col gap-[18px] lg:sticky lg:top-[108px]">
            <span className="eyebrow text-brand">Contact</span>
            <h2 className="font-display text-[clamp(40px,5vw,56px)] leading-[1.1] font-bold">
              คุยกับทีมงาน
              <br />
              ช่องทางไหนก็ได้
            </h2>
            <p className="text-lg text-muted-night">ตอบได้ทั้งภาษาไทย อังกฤษ และจีน [รอยืนยันภาษาที่รองรับ]</p>
          </div>
          <div className="flex flex-col border-b border-night-line">
            {contactChannels.map((c) => (
              <a key={c.name} href={c.href ?? "#contact"} className="group flex items-center justify-between gap-5 border-t border-night-line py-6">
                <span className="flex flex-col">
                  <span className="font-display text-[34px] leading-tight font-bold">{c.name}</span>
                  <span className="text-muted-night">{c.handle}</span>
                </span>
                <span className="grid size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-[#5a544d] transition-colors group-hover:border-brand group-hover:bg-brand">
                  <Icon name="arrowUpRight" size={22} strokeWidth={2} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" className="wrap flex scroll-mt-24 flex-col gap-8 pt-24 pb-12">
        <div className="flex flex-col gap-2">
          <span className="eyebrow text-brand">Guides &amp; manuals</span>
          <h2 className="font-display text-[clamp(34px,4.5vw,48px)] leading-[1.1] font-bold">วิธีใช้และคู่มือ</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {guides.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}#use`} className="flex flex-col overflow-hidden rounded-[14px] border border-line">
              <div className="relative grid aspect-[16/10] place-items-center bg-stage">
                {p.image && <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} sizes="(min-width: 768px) 33vw, 100vw" className="blend-stage h-[90%] w-[70%] object-contain" />}
                <span className="absolute inset-0 bg-night/35" />
                <span className="absolute grid size-[60px] place-items-center rounded-full bg-white text-ink"><PlayIcon size={22} /></span>
              </div>
              <div className="flex flex-col gap-2 px-5 py-[18px]">
                <span className="font-mono text-xs text-muted">{p.model}</span>
                <span className="font-display text-xl font-semibold">{p.nameEn}</span>
                <span className="flex flex-wrap gap-1.5">
                  {["วิดีโอ", "คู่มือ PDF", "การติดตั้ง"].map((t) => (
                    <span key={t} className="rounded-full bg-stage px-2.5 py-0.5 text-xs font-semibold">{t}</span>
                  ))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="warranty" className="wrap grid scroll-mt-24 items-start gap-16 py-[72px] lg:grid-cols-2">
        <div className="flex flex-col gap-[18px]">
          <span className="eyebrow text-brand">Warranty</span>
          <h2 className="font-display text-[clamp(34px,4.5vw,48px)] leading-[1.1] font-bold">การรับประกัน</h2>
          <div className="flex items-baseline gap-3">
            <span className="hollow font-display text-[120px] leading-[0.9] font-bold text-ink">5</span>
            <span className="font-display text-[28px] font-semibold">
              ปี
              <br />
              <span className="text-base font-normal text-muted">สูงสุด ตามเงื่อนไขแต่ละรุ่น*</span>
            </span>
          </div>
          <dl className="flex flex-col border-b border-line">
            {[
              ["ครอบคลุม", "[รอยืนยัน]"],
              ["ไม่ครอบคลุม", "[รอยืนยัน]"],
              ["พื้นที่ให้บริการ", "[รอยืนยัน: ไทย ลาว เมียนมา จีน]"],
              ["เริ่มนับจาก", "[วันส่งมอบ หรือวันติดตั้ง]"],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-4 border-t border-line py-[18px] sm:grid-cols-[200px_minmax(0,1fr)]">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="service" className="scroll-mt-24">
          <ServiceForm />
        </div>
      </section>

      <section id="faq" className="wrap flex max-w-[920px] scroll-mt-24 flex-col gap-5 pt-12 pb-[104px]">
        <h2 className="font-display text-[40px] font-bold">คำถามที่พบบ่อย</h2>
        <div className="border-b border-line">
          {faqs.map(([q, a], i) => (
            <details key={q} open={i === 0} className="group border-t border-line">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-[26px] text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
