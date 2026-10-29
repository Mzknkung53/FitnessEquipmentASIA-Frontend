import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon, PlayIcon } from "@/components/icons";
import { getProducts } from "@/lib/catalog";
import { langFrom } from "@/lib/i18n";
import { fmt, localePath } from "@/lib/i18n/config";
import { branches, chatChannels, contactChannels, mapsEmbed, mapsLink, showroomPhone } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/showroom">): Promise<Metadata> {
  const { t } = await langFrom(params);
  return { title: t.meta.showroom };
}

export default async function ShowroomPage({ params }: PageProps<"/[lang]/showroom">) {
  const { lang, t } = await langFrom(params);
  const s = t.showroom;
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
              {s.titleA}
              <br />
              <span className="hollow text-ink">{s.titleB}</span>
              <span className="text-brand">.</span>
            </h1>
            <p className="max-w-[520px] text-[19px] text-ink-2">{s.intro}</p>
            <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-4 gap-y-2.5">
              <dt className="text-muted">{s.locations}</dt><dd className="font-semibold">{s.locationsValue}</dd>
              <dt className="text-muted">{s.phone}</dt>
              <dd className="font-semibold"><a href={showroomPhone.tel} className="underline-offset-2 hover:underline">{showroomPhone.display}</a></dd>
            </dl>
            <div className="flex flex-wrap gap-3">
              <a href="#contact" className="inline-flex min-h-14 items-center rounded-md bg-brand px-7 font-display text-lg font-semibold text-white">{s.bookVisit}</a>
              <a href="#map" className="inline-flex min-h-14 items-center gap-2 rounded-md border-[1.5px] border-ink px-6 font-display text-lg font-medium">{s.openMap} <Icon name="arrow" /></a>
            </div>
          </div>
          <div id="map" className="flex scroll-mt-28 flex-col gap-4">
            {branches.map((b) => (
              <article key={b.id} className="flex flex-col overflow-hidden rounded-[18px] bg-night text-white sm:flex-row">
                <iframe
                  src={mapsEmbed(b)}
                  title={fmt(s.mapTitle, { name: b.name })}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[180px] w-full shrink-0 border-0 bg-night-2 sm:h-auto sm:w-[42%]"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold">
                    <Icon name="pin" size={13} /> {s.gymTag}
                  </span>
                  <span className="font-display text-[22px] leading-tight font-bold">{b.name}</span>
                  <span className="text-sm font-semibold text-[#e3b25a]">{b.area[lang]}</span>
                  <span className="text-sm text-muted-night">{lang === "th" ? b.address.th : b.address.en}</span>
                  <span className="text-sm text-muted-night">
                    {s.hours}: {b.hours?.[lang] ?? s.hoursTbc}
                  </span>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <a href={mapsLink(b)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-ink hover:bg-brand hover:text-white">
                      {s.directions} <Icon name="arrowUpRight" size={16} />
                    </a>
                    <a href={showroomPhone.tel} className="inline-flex min-h-11 items-center rounded-lg border border-[#5a544d] px-4 text-sm font-semibold hover:border-white">
                      {s.call} {showroomPhone.display}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-night text-white">
        <div className="wrap grid items-start gap-16 py-24 lg:grid-cols-2">
          <div className="flex flex-col gap-[18px] lg:sticky lg:top-[108px]">
            <span className="eyebrow text-brand">Contact</span>
            <h2 className="font-display text-[clamp(40px,5vw,56px)] leading-[1.1] font-bold">
              {s.contactTitle1}
              <br />
              {s.contactTitle2}
            </h2>
            <p className="text-lg text-muted-night">{s.languages}</p>
          </div>
          <div className="flex flex-col border-b border-night-line">
            {contactChannels.map((c) => (
              <a key={c.id} href={c.href ?? "#contact"} className="group flex items-center justify-between gap-5 border-t border-night-line py-6">
                <span className="flex flex-col">
                  <span className="font-display text-[34px] leading-tight font-bold">{t.contact.channels[c.id]}</span>
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
          <h2 className="font-display text-[clamp(34px,4.5vw,48px)] leading-[1.1] font-bold">{s.guidesTitle}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {guides.map((p) => (
            <Link key={p.slug} href={localePath(lang, `/products/${p.slug}#use`)} className="flex flex-col overflow-hidden rounded-[14px] border border-line">
              <div className="relative grid aspect-[16/10] place-items-center bg-stage">
                {p.image && <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} sizes="(min-width: 768px) 33vw, 100vw" className="blend-stage h-[90%] w-[70%] object-contain" />}
                <span className="absolute inset-0 bg-night/35" />
                <span className="absolute grid size-[60px] place-items-center rounded-full bg-white text-ink"><PlayIcon size={22} /></span>
              </div>
              <div className="flex flex-col gap-2 px-5 py-[18px]">
                <span className="font-mono text-xs text-muted">{p.model}</span>
                <span className="font-display text-xl font-semibold">{p.nameEn}</span>
                <span className="flex flex-wrap gap-1.5">
                  {s.guideTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-stage px-2.5 py-0.5 text-xs font-semibold">{tag}</span>
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
          <h2 className="font-display text-[clamp(34px,4.5vw,48px)] leading-[1.1] font-bold">{s.warrantyTitle}</h2>
          <div className="flex items-baseline gap-3">
            <span className="hollow font-display text-[120px] leading-[0.9] font-bold text-ink">5</span>
            <span className="font-display text-[28px] font-semibold">
              {s.years}
              <br />
              <span className="text-base font-normal text-muted">{s.warrantyMax}</span>
            </span>
          </div>
          <dl className="flex flex-col border-b border-line">
            {s.warrantyRows.map(([k, v]) => (
              <div key={k} className="grid gap-4 border-t border-line py-[18px] sm:grid-cols-[200px_minmax(0,1fr)]">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="service" className="flex scroll-mt-24 flex-col gap-[18px] rounded-[18px] bg-stage p-6 sm:p-9">
          <span className="flex items-center gap-3 font-display text-[28px] font-bold">
            <Icon name="wrench" size={26} className="text-brand" />
            {s.repairTitle}
          </span>
          <p className="text-ink-2">{s.repairIntro}</p>
          <ul className="flex flex-col gap-2 text-[15px]">
            {s.repairChecklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            {chatChannels.map((c, i) =>
              c.href ? (
                <a
                  key={c.id}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex min-h-[58px] flex-1 items-center justify-center gap-2.5 rounded-lg px-6 font-display text-lg font-semibold ${
                    i === 0 ? "bg-ink text-white hover:bg-brand" : "border-[1.5px] border-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  <Icon name="chat" />
                  {fmt(s.chatVia, { channel: t.contact.channels[c.id] })}
                </a>
              ) : (
                <span key={c.id} className="inline-flex min-h-[58px] flex-1 flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-control px-6 text-center">
                  <span className="font-display text-lg font-semibold">{t.contact.channels[c.id]}</span>
                  <span className="text-sm text-muted">{c.handle}</span>
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section id="faq" className="wrap flex max-w-[920px] scroll-mt-24 flex-col gap-5 pt-12 pb-[104px]">
        <h2 className="font-display text-[40px] font-bold">{s.faqTitle}</h2>
        <div className="border-b border-line">
          {s.faqs.map(([q, a], i) => (
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
