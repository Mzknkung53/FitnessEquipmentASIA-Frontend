import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon, PlayIcon } from "@/components/icons";
import { NewBadge } from "@/components/product-bits";
import { ProductCard } from "@/components/product-card";
import { getCategories, getNewArrivals, getProducts } from "@/lib/catalog";
import { langFrom } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";
import { categoryName } from "@/lib/i18n/names";

/** Entrance order for .hero-in lines. */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

const marquee = ["PLATE-LOADED", "CARDIO", "STRENGTH MACHINES", "RACKS", "FREE WEIGHTS", "GYM FLOORING"];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang, t } = await langFrom(params);
  const h = t.home;
  const to = (path: string) => localePath(lang, path);
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
            <span className="hero-in eyebrow flex items-center gap-3 text-muted">
              <span className="h-[3px] w-8 bg-brand" />
              Built for your next level
            </span>
            <h1 className="font-display text-[clamp(52px,8vw,96px)] leading-[1.02] font-bold tracking-[-0.025em]">
              <span className="hero-in inline-block" style={order(1)}>{h.heroLine1}</span>
              <br />
              <span className="hero-in inline-block" style={order(2)}>
                <span className="hollow text-ink">{h.heroLine2}</span>
                <span className="text-brand">.</span>
              </span>
            </h1>
            <p className="hero-in max-w-[520px] text-xl leading-normal text-ink-2 sm:text-[22px]" style={order(3)}>{h.heroBody}</p>
            <div className="hero-in flex flex-wrap gap-3.5" style={order(4)}>
              <Link href={to("/products")} className="glow-ring relative inline-flex min-h-14 items-center gap-2.5 rounded-md bg-brand px-7 font-display text-lg font-semibold text-white hover:bg-brand-dark">
                {h.heroCta} <Icon name="arrow" size={20} strokeWidth={2} />
              </Link>
              <Link href={to("/quote")} className="inline-flex min-h-14 items-center gap-2.5 rounded-md border-[1.5px] border-ink px-6 font-display text-lg font-medium hover:bg-ink hover:text-white">
                {h.heroConsult} <Icon name="arrowUpRight" strokeWidth={2} />
              </Link>
            </div>
            <ul className="hero-in mt-2 flex flex-wrap gap-x-7 gap-y-2.5 text-[15px] text-ink-2" style={order(5)}>
              {h.heroPoints.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Icon name="check" className="text-brand" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {hero?.image && (
            <div className="relative grid place-items-center">
              <Image src={hero.image.src} alt={hero.image.alt} width={hero.image.width} height={hero.image.height} loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 560px, 90vw" className="blend-stage h-auto w-full max-w-[560px]" />
              <Link href={to(`/products/${hero.slug}`)} className="absolute bottom-6 left-0 flex items-center gap-3.5 rounded-xl bg-white px-[18px] py-3.5 shadow-[0_16px_40px_-16px_rgba(22,19,15,.35)]">
                <span className="flex flex-col leading-snug">
                  <span className="font-mono text-xs text-muted">{hero.model}{hero.demo && ` · ${t.common.sample}`}</span>
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
                  {h.tryInShowroom}
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
        <SectionHead eyebrow="Shop by category" title={<>{h.categoriesTitleA}<span className="hollow-thin">{h.categoriesTitleB}</span></>} href={to("/products")} link={t.common.seeAllProducts} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c, i) => (
            <Link key={c.id} href={to(`/products?cat=${c.id}`)} className="flex min-h-[190px] flex-col justify-between gap-8 rounded-md bg-night p-[26px] text-white transition-colors hover:bg-brand">
              <span className="font-mono text-sm opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex items-end justify-between gap-3">
                <span className="flex flex-col">
                  <span className="font-display text-[28px] leading-tight font-semibold">{categoryName(c, lang, t)}</span>
                  {lang !== "en" && <span className="text-sm opacity-70">{c.nameEn}</span>}
                </span>
                <Icon name="arrowUpRight" size={26} strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="wrap flex flex-col gap-8 pt-[72px] pb-10">
        <SectionHead eyebrow="New arrivals" title={h.newArrivals} href={to("/products")} link={t.common.seeAllProducts} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newArrivals.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Choose your path */}
      <section className="wrap py-12">
        <p className="eyebrow pb-5 text-brand">Choose your path</p>
        <PathRow href={to("/products")} title={h.pathBuyTitle} body={h.pathBuyBody} img={withImages[2]?.image} />
        <PathRow href={to("/quote")} title={h.pathGymTitle} body={h.pathGymBody} img={withImages[1]?.image} />
        <PathRow href={to("/showroom")} title={<>{h.pathShowroomA}<span className="hollow-thin">{h.pathShowroomB}</span></>} body={t.common.showroomLine} img={withImages[0]?.image} last />
      </section>

      {/* Gym projects */}
      <section className="mt-12 bg-night text-white">
        <div className="wrap grid items-center gap-16 py-[104px] lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <span className="eyebrow text-brand">Gym projects</span>
            <h2 className="font-display text-[clamp(38px,5vw,56px)] leading-[1.1] font-bold tracking-[-0.015em]">
              {h.gymTitle1}
              <br />
              {h.gymTitle2}
            </h2>
            <p className="max-w-[520px] text-lg text-muted-night">{h.gymBody}</p>
            <ol className="mt-2 flex flex-col border-b border-night-line">
              {h.gymSteps.map((s, i) => (
                <li key={s} className="flex items-baseline gap-5 border-t border-night-line py-[18px] text-lg">
                  <span className="w-11 font-display text-[28px] font-bold text-brand">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <form action={to("/quote")} className="flex flex-col gap-[18px] rounded-2xl bg-white p-6 text-ink sm:p-9">
            <span className="font-display text-[26px] font-semibold">{h.planTitle}</span>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              {h.spaceType}
              <select name="space" className="min-h-[52px] rounded-lg border border-control bg-white px-3.5 text-base font-normal">
                {h.spaces.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                {h.area}
                <input name="area" inputMode="numeric" placeholder={h.areaExample} className="min-h-[52px] rounded-lg border border-control px-3.5 text-base font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>
                  {h.budget} <span className="font-normal text-muted">{t.common.optional}</span>
                </span>
                <input name="budget" placeholder={h.budgetExample} className="min-h-[52px] rounded-lg border border-control px-3.5 text-base font-normal" />
              </label>
            </div>
            <button type="submit" className="min-h-14 rounded-md bg-brand font-display text-lg font-semibold text-white hover:bg-brand-dark">
              {h.planSubmit}
            </button>
            <span className="text-[13px] text-muted">{h.planNote}</span>
          </form>
        </div>
      </section>

      {/* How to use */}
      <section className="wrap flex flex-col gap-10 pt-[104px] pb-14">
        <SectionHead eyebrow="How to use" title={h.howToTitle} href={to("/showroom#guides")} link={h.howToLink} />
        <div className="grid gap-6 md:grid-cols-3">
          {withImages.map((p) => (
            <Link key={p.slug} href={to(`/products/${p.slug}#use`)} className="flex flex-col gap-3.5">
              <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[14px] bg-stage">
                {p.image && <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} sizes="(min-width: 768px) 33vw, 100vw" className="blend-stage h-[90%] w-[70%] object-contain" />}
                <span className="absolute inset-0 bg-night/40" />
                <span className="absolute grid size-[68px] place-items-center rounded-full bg-white text-ink">
                  <PlayIcon />
                </span>
                <span className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold">{t.common.sampleVideo}</span>
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
          <Value title={h.warrantyTitle} note={h.warrantyNote}>
            <span className="font-display text-[44px] leading-none font-bold">
              5<span className="text-xl font-semibold"> {h.years}</span>
            </span>
          </Value>
          <Value title={h.ownMadeTitle} note={h.ownMadeNote}><Icon name="home" size={40} strokeWidth={1.4} className="text-brand" /></Value>
          <Value title={h.installTitle} note={h.installNote}><Icon name="wrench" size={40} strokeWidth={1.4} className="text-brand" /></Value>
          <Value title={h.supportTitle} note={h.supportNote}><Icon name="chat" size={40} strokeWidth={1.4} className="text-brand" /></Value>
        </div>
      </section>

      {/* Showroom band */}
      <section className="relative overflow-hidden bg-brand text-white">
        <span aria-hidden="true" className="absolute -top-10 -right-5 font-display text-[clamp(120px,18vw,240px)] leading-none font-extrabold whitespace-nowrap text-white/10">
          SHOWROOM
        </span>
        <div className="wrap relative flex flex-wrap items-center justify-between gap-8 py-20">
          <div className="flex max-w-[640px] flex-col gap-3">
            <h2 className="font-display text-[clamp(36px,5vw,56px)] leading-[1.1] font-bold">{h.showroomBand}</h2>
            <span className="text-lg opacity-90">
              {t.common.showroomLine}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={to("/showroom")} className="inline-flex min-h-14 items-center rounded-md bg-white px-7 font-display text-lg font-semibold text-ink">
              {h.bookVisit}
            </Link>
            <Link href={to("/showroom#map")} className="inline-flex min-h-14 items-center rounded-md border-[1.5px] border-white px-6 font-display text-lg font-medium">
              {h.directions}
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
