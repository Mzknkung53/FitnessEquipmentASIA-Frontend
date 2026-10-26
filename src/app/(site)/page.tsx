import Image from "next/image";
import Link from "next/link";
import { Icon, PlayIcon } from "@/components/icons";
import { NewBadge } from "@/components/product-bits";
import { ProductCard } from "@/components/product-card";
import { getCategories, getNewArrivals, getProducts } from "@/lib/catalog";
import { showroom } from "@/lib/site";

const marquee = ["PLATE-LOADED", "CARDIO", "STRENGTH MACHINES", "RACKS", "FREE WEIGHTS", "GYM FLOORING"];

export default async function HomePage() {
  const [categories, newArrivals, products] = await Promise.all([getCategories(), getNewArrivals(3), getProducts()]);
  const hero = newArrivals[0] ?? products[0];
  const withImages = products.filter((p) => p.image);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-stage">
        <span aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-[70px] font-display text-[clamp(120px,22vw,300px)] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap text-[#e7e5e1]">
          STRENGTH
        </span>
        <div className="wrap relative grid min-h-[620px] items-center gap-8 py-14 lg:grid-cols-[1fr_1.05fr] lg:py-[72px]">
          <div className="flex flex-col items-start gap-7">
            <span className="eyebrow flex items-center gap-3 text-muted">
              <span className="h-[3px] w-8 bg-brand" />
              Built for your next level
            </span>
            <h1 className="font-display text-[clamp(52px,8vw,96px)] leading-[1.02] font-bold tracking-[-0.025em]">
              ยิมของคุณ
              <br />
              <span className="hollow text-ink">เริ่มที่นี่</span>
              <span className="text-brand">.</span>
            </h1>
            <p className="max-w-[520px] text-xl leading-normal text-ink-2 sm:text-[22px]">อุปกรณ์ฟิตเนสแบรนด์ของเราเอง สำหรับบ้านและธุรกิจยิม ตั้งแต่เครื่องเดียวจนถึงทั้งยิม</p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/products" className="inline-flex min-h-14 items-center gap-2.5 rounded-md bg-brand px-7 font-display text-lg font-semibold text-white hover:bg-brand-dark">
                ดูสินค้าทั้งหมด <Icon name="arrow" size={20} strokeWidth={2} />
              </Link>
              <Link href="/quote" className="inline-flex min-h-14 items-center gap-2.5 rounded-md border-[1.5px] border-ink px-6 font-display text-lg font-medium hover:bg-ink hover:text-white">
                ปรึกษาจัดยิม <Icon name="arrowUpRight" strokeWidth={2} />
              </Link>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-7 gap-y-2.5 text-[15px] text-ink-2">
              {["โรงงาน คลัง และโชว์รูมของเราเอง", "รับประกันสูงสุด 5 ปี*", "ทีมติดตั้งและบริการหลังการขาย"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="check" className="text-brand" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {hero?.image && (
            <div className="relative grid place-items-center">
              <Image src={hero.image.src} alt={hero.image.alt} width={hero.image.width} height={hero.image.height} loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 560px, 90vw" className="blend-stage h-auto w-full max-w-[560px]" />
              <Link href={`/products/${hero.slug}`} className="absolute bottom-6 left-0 flex items-center gap-3.5 rounded-xl bg-white px-[18px] py-3.5 shadow-[0_16px_40px_-16px_rgba(22,19,15,.35)]">
                <span className="flex flex-col leading-snug">
                  <span className="font-mono text-xs text-muted">{hero.model}{hero.demo && " · ตัวอย่าง"}</span>
                  <span className="font-display text-lg font-semibold">{hero.nameEn}</span>
                </span>
                <span className="grid size-10 place-items-center rounded-full bg-ink text-white">
                  <Icon name="arrow" strokeWidth={2} />
                </span>
              </Link>
              <span className="absolute top-2 right-2 flex items-center gap-2">
                {hero.isNew && <NewBadge />}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[13px] font-semibold text-white">
                  <span className="size-2 rounded-full bg-[#3ecf6e]" />
                  ลองได้ที่โชว์รูม
                </span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Marquee */}
      <div aria-hidden="true" className="overflow-hidden border-t-4 border-brand bg-night text-white">
        <div className="marquee-track py-[18px] font-display text-[22px] font-semibold tracking-[0.04em] whitespace-nowrap sm:text-[26px]">
          {[0, 1].map((k) => (
            <span key={k} className="flex items-center gap-10 pr-10">
              {marquee.map((m) => (
                <span key={m} className="flex items-center gap-10">
                  {m}
                  <span className="text-brand">●</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="wrap flex flex-col gap-8 pt-[88px] pb-4">
        <SectionHead eyebrow="Shop by category" title={<>เลือกตาม<span className="hollow-thin">ประเภท</span></>} href="/products" link="ดูสินค้าทั้งหมด" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c, i) => (
            <Link key={c.id} href={`/products?cat=${c.id}`} className="flex min-h-[190px] flex-col justify-between gap-8 rounded-md bg-night p-[26px] text-white transition-colors hover:bg-brand">
              <span className="font-mono text-sm opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex items-end justify-between gap-3">
                <span className="flex flex-col">
                  <span className="font-display text-[28px] leading-tight font-semibold">{c.nameTh}</span>
                  <span className="text-sm opacity-70">{c.nameEn}</span>
                </span>
                <Icon name="arrowUpRight" size={26} strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="wrap flex flex-col gap-8 pt-[72px] pb-10">
        <SectionHead eyebrow="New arrivals" title="สินค้าเข้าใหม่" href="/products" link="ดูสินค้าทั้งหมด" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newArrivals.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Choose your path */}
      <section className="wrap py-12">
        <p className="eyebrow pb-5 text-brand">Choose your path</p>
        <PathRow href="/products" title="ซื้อใช้ที่บ้าน" body="ราคาชัด ชำระเงินออนไลน์ได้สำหรับสินค้าพร้อมส่ง" img={withImages[2]?.image} />
        <PathRow href="/quote" title="จัดอุปกรณ์ให้ยิม" body="รวมหลายรายการในคำขอเดียว ทีมงานเสนอราคา ขนส่ง และติดตั้ง" img={withImages[1]?.image} />
        <PathRow href="/showroom" title={<>ลองที่<span className="hollow-thin">โชว์รูม</span></>} body={`${showroom.address} · ${showroom.hours}`} img={withImages[0]?.image} last />
      </section>

      {/* Gym projects */}
      <section className="mt-12 bg-night text-white">
        <div className="wrap grid items-center gap-16 py-[104px] lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <span className="eyebrow text-brand">Gym projects</span>
            <h2 className="font-display text-[clamp(38px,5vw,56px)] leading-[1.1] font-bold tracking-[-0.015em]">
              จัดชุดอุปกรณ์ทั้งยิม
              <br />
              ในคำขอเดียว
            </h2>
            <p className="max-w-[520px] text-lg text-muted-night">เลือกสินค้าหลายรายการ ทั้งที่มีราคาและต้องขอราคา แนบแปลนพื้นที่ แล้วให้ทีมงานตรวจสอบสต็อก ค่าขนส่ง ส่วนลด และการติดตั้งก่อนเสนอราคา</p>
            <ol className="mt-2 flex flex-col border-b border-night-line">
              {["เลือกอุปกรณ์ หรือบอกขนาดพื้นที่และงบประมาณ", "ส่งคำขอใบเสนอราคา ไม่มีค่าใช้จ่าย", "ยืนยันการจัดส่งและติดตั้งกับทีมงาน"].map((t, i) => (
                <li key={t} className="flex items-baseline gap-5 border-t border-night-line py-[18px] text-lg">
                  <span className="w-11 font-display text-[28px] font-bold text-brand">0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <form action="/quote" className="flex flex-col gap-[18px] rounded-2xl bg-white p-6 text-ink sm:p-9">
            <span className="font-display text-[26px] font-semibold">เริ่มวางแผนยิมของคุณ</span>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              ประเภทพื้นที่
              <select name="space" className="min-h-[52px] rounded-lg border border-control bg-white px-3.5 text-base font-normal">
                <option>ยิมเชิงพาณิชย์</option>
                <option>ฟิตเนสในโรงแรม / คอนโด</option>
                <option>สตูดิโอ / ฟังก์ชันนอล</option>
                <option>ยิมในบ้าน</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                ขนาดพื้นที่ (ตร.ม.)
                <input name="area" inputMode="numeric" placeholder="เช่น 120" className="min-h-[52px] rounded-lg border border-control px-3.5 text-base font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>
                  งบประมาณ <span className="font-normal text-muted">(ไม่บังคับ)</span>
                </span>
                <input name="budget" placeholder="เช่น 1,500,000" className="min-h-[52px] rounded-lg border border-control px-3.5 text-base font-normal" />
              </label>
            </div>
            <button type="submit" className="min-h-14 rounded-md bg-brand font-display text-lg font-semibold text-white hover:bg-brand-dark">
              ขอคำแนะนำจัดชุดยิม
            </button>
            <span className="text-[13px] text-muted">ไม่มีการเรียกเก็บเงิน ทีมงานติดต่อกลับผ่านช่องทางที่คุณเลือก</span>
          </form>
        </div>
      </section>

      {/* How to use */}
      <section className="wrap flex flex-col gap-10 pt-[104px] pb-14">
        <SectionHead eyebrow="How to use" title="ใช้งานให้ถูกตั้งแต่วันแรก" href="/showroom#guides" link="คู่มือและวิดีโอทั้งหมด" />
        <div className="grid gap-6 md:grid-cols-3">
          {withImages.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}#use`} className="flex flex-col gap-3.5">
              <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[14px] bg-stage">
                {p.image && <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} sizes="(min-width: 768px) 33vw, 100vw" className="blend-stage h-[90%] w-[70%] object-contain" />}
                <span className="absolute inset-0 bg-night/40" />
                <span className="absolute grid size-[68px] place-items-center rounded-full bg-white text-ink">
                  <PlayIcon />
                </span>
                <span className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold">วิดีโอตัวอย่าง · รอไฟล์จริง</span>
              </div>
              <span className="font-mono text-xs text-muted">{p.model}</span>
              <span className="-mt-2 font-display text-xl leading-snug font-semibold">{p.usageSteps[0]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Value strip */}
      <section className="wrap pt-14 pb-[104px]">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <Value title="รับประกันสูงสุด" note="*ตามเงื่อนไขของแต่ละรุ่น [รอยืนยัน]">
            <span className="font-display text-[44px] leading-none font-bold">
              5<span className="text-xl font-semibold"> ปี</span>
            </span>
          </Value>
          <Value title="ผลิตและสต็อกเอง" note="โรงงาน คลังสินค้า และโชว์รูมของแบรนด์"><Icon name="home" size={40} strokeWidth={1.4} className="text-brand" /></Value>
          <Value title="ติดตั้งโดยทีมงาน" note="ประเมินพื้นที่และแจ้งค่าบริการก่อนยืนยัน"><Icon name="wrench" size={40} strokeWidth={1.4} className="text-brand" /></Value>
          <Value title="ทีมงานตอบคำถาม" note="LINE · WeChat · WhatsApp · โทร"><Icon name="chat" size={40} strokeWidth={1.4} className="text-brand" /></Value>
        </div>
      </section>

      {/* Showroom band */}
      <section className="relative overflow-hidden bg-brand text-white">
        <span aria-hidden="true" className="absolute -top-10 -right-5 font-display text-[clamp(120px,18vw,240px)] leading-none font-extrabold whitespace-nowrap text-white/10">
          SHOWROOM
        </span>
        <div className="wrap relative flex flex-wrap items-center justify-between gap-8 py-20">
          <div className="flex max-w-[640px] flex-col gap-3">
            <h2 className="font-display text-[clamp(36px,5vw,56px)] leading-[1.1] font-bold">มาลองเครื่องจริงที่โชว์รูม</h2>
            <span className="text-lg opacity-90">
              {showroom.address} · {showroom.hours}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/showroom" className="inline-flex min-h-14 items-center rounded-md bg-white px-7 font-display text-lg font-semibold text-ink">
              นัดเข้าชมโชว์รูม
            </Link>
            <Link href="/showroom#map" className="inline-flex min-h-14 items-center rounded-md border-[1.5px] border-white px-6 font-display text-lg font-medium">
              เส้นทาง
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, href, link }: { eyebrow: string; title: React.ReactNode; href: string; link: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <span className="eyebrow text-brand">{eyebrow}</span>
        <h2 className="font-display text-[clamp(34px,4.5vw,48px)] leading-[1.1] font-bold tracking-[-0.015em]">{title}</h2>
      </div>
      <Link href={href} className="inline-flex items-center gap-2 border-b-2 border-ink pb-0.5 font-semibold">
        {link} <Icon name="arrow" size={16} strokeWidth={2} />
      </Link>
    </div>
  );
}

function PathRow({ href, title, body, img, last = false }: { href: string; title: React.ReactNode; body: string; img?: { src: string; width: number; height: number }; last?: boolean }) {
  return (
    <Link href={href} className={`group flex items-center justify-between gap-6 border-t border-[#e3e0db] py-7 ${last ? "border-b" : ""}`}>
      <span className="flex flex-col gap-1">
        <span className="font-display text-[clamp(36px,5.5vw,60px)] leading-[1.05] font-bold tracking-[-0.02em]">{title}</span>
        <span className="text-[17px] text-muted">{body}</span>
      </span>
      <span className="flex items-center gap-5">
        {img && (
          <span className="hidden h-[90px] w-[120px] place-items-center overflow-hidden rounded-[10px] bg-stage sm:grid">
            <Image src={img.src} alt="" width={img.width} height={img.height} sizes="120px" className="blend-stage h-[90%] w-[90%] object-contain" />
          </span>
        )}
        <span className="grid size-[68px] shrink-0 place-items-center rounded-full border-[1.5px] border-ink transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
          <Icon name="arrow" size={24} strokeWidth={2} />
        </span>
      </span>
    </Link>
  );
}

function Value({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 bg-white p-8">
      {children}
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-muted">{note}</span>
    </div>
  );
}
