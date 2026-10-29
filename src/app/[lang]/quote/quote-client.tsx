"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { submitQuoteRequest } from "@/app/[lang]/quote/actions";
import { useI18n } from "@/components/i18n-provider";
import { Icon } from "@/components/icons";
import { Pictogram, StatusChip } from "@/components/product-bits";
import { QtyStepper } from "@/components/qty-stepper";
import { fmt } from "@/lib/i18n/config";
import { formatMoney, VAT_RATE } from "@/lib/pricing";
import { shop, useShop } from "@/lib/shop-store";
import { destinationCountries } from "@/lib/site";
import type { ContactMethod, Product } from "@/lib/types";

const methodIds: ContactMethod[] = ["line", "wechat", "whatsapp", "phone", "email"];

const input = "min-h-[52px] w-full rounded-lg border border-control bg-white px-3.5 text-base font-normal";

export function QuoteClient({
  products,
  accountEmail = null,
  accountName = null,
}: {
  products: Product[];
  accountEmail?: string | null;
  accountName?: string | null;
}) {
  const { lang, t, href } = useI18n();
  const q = t.quote;
  const { quote, currency, ready } = useShop();
  const params = useSearchParams();
  const [method, setMethod] = useState<ContactMethod>(accountEmail ? "email" : "line");
  const [name, setName] = useState(accountName ?? "");
  const [contact, setContact] = useState(accountEmail ?? "");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState(() => {
    // Prefill from the "plan your gym" form on the home page.
    const area = params.get("area");
    const budget = params.get("budget");
    const parts = [params.get("space"), area && fmt(q.prefillArea, { area }), budget && fmt(q.prefillBudget, { budget })].filter(Boolean);
    return parts.join(" · ");
  });
  const [tried, setTried] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [attachmentFailed, setAttachmentFailed] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  const lines = quote
    .map((l) => {
      const product = products.find((p) => p.slug === l.slug);
      const variant = product?.variants.find((v) => v.sku === l.sku);
      return product && variant ? { ...l, product, variant } : null;
    })
    .filter((l) => l !== null);

  const priced = lines.filter((l) => l.variant.priceThb != null);
  const subtotal = priced.reduce((s, l) => s + (l.variant.priceThb ?? 0) * l.qty, 0);
  const m = q.methods[method];
  const errors = {
    name: tried && !name.trim(),
    contact: tried && !contact.trim(),
    city: tried && !city.trim(),
  };
  const errorCount = Object.values(errors).filter(Boolean).length;
  const advisoryOnly = lines.length === 0;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !city.trim()) {
      setTried(true);
      return;
    }
    const form = new FormData(e.currentTarget);
    form.set("lang", lang);
    form.set("items", JSON.stringify(lines.map((l) => ({ sku: l.sku, qty: l.qty, note: l.note }))));
    setSendError(null);
    // Saves the request in Supabase. It never charges money or reserves stock.
    startSending(async () => {
      const result = await submitQuoteRequest(form);
      if (!result.ok) {
        setSendError(result.error);
        return;
      }
      setSentRef(result.reference);
      setAttachmentFailed(Boolean(result.attachmentFailed));
      shop.clearQuote();
    });
  };

  if (!ready) return <div className="wrap min-h-[70vh] py-24 text-muted" aria-busy="true">{q.loading}</div>;

  if (sentRef) {
    return (
      <section className="bg-night text-white">
        <div className="flash-in wrap flex max-w-[880px] flex-col gap-7 pt-24 pb-[120px]">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#16261c] px-3.5 py-1.5 font-semibold text-[#6cc28d]">
            <Icon name="check" className="tick-draw" /> {q.received}
          </span>
          <h1 className="font-display text-[clamp(40px,6vw,64px)] leading-[1.05] font-bold tracking-[-0.02em]">
            {q.thanks}
            <br />
            <span className="hollow text-white">{q.thanksLine2}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-night">{q.reference}</span>
            <span className="bump rounded-md bg-[#1f1d1a] px-3.5 py-1.5 font-mono text-xl [animation-delay:250ms]">{sentRef}</span>
          </div>
          {attachmentFailed && (
            <span className="flex items-center gap-2 text-[#e3b25a]">
              <Icon name="alert" /> {fmt(q.attachmentFailed, { method: m.label })}
            </span>
          )}
          <ol className="flex flex-col border-b border-night-line">
            {q.nextSteps.map((step, i) => (
              <li key={step} className="flex gap-5 border-t border-night-line py-[18px]">
                <span className="w-10 font-display text-[22px] font-bold text-brand">0{i + 1}</span>
                {fmt(step, { method: m.label })}
              </li>
            ))}
          </ol>
          <span className="text-muted-night">{q.noChargeYet}</span>
          <Link href={href("/products")} className="inline-flex min-h-14 items-center self-start rounded-md bg-white px-7 font-display text-lg font-semibold text-ink">
            {q.backToProducts}
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
              {q.title}<span className="text-brand">.</span>
            </h1>
            <p className="text-lg text-ink-2">{q.intro}</p>
          </div>
          <span className="font-display text-xl">
            <span className="hollow-thin text-[64px] leading-none font-bold text-ink">{String(lines.length).padStart(2, "0")}</span> {t.common.items}
          </span>
        </div>
      </section>

      <form onSubmit={submit} noValidate className="wrap flex flex-wrap items-start gap-10 pt-12 pb-24">
        <div className="flex min-w-0 flex-[999_1_620px] flex-col gap-14">
          <section aria-label={q.itemsInList} className="flex flex-col border-t-2 border-ink">
            {advisoryOnly && (
              <div className="flex flex-col gap-3 border-b border-line py-8">
                <span className="font-display text-2xl font-semibold">{q.emptyTitle}</span>
                <span className="text-muted">{q.emptyBody} <Link href={href("/products")} className="font-semibold text-ink underline">{q.pickFirst}</Link></span>
              </div>
            )}
            {lines.map((l) => (
              <div key={l.sku} className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-6 gap-y-4 border-b border-line py-6 sm:grid-cols-[132px_minmax(0,1fr)_auto]">
                <Link href={href(`/products/${l.slug}?v=${l.sku}`)} className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-stage">
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
                  <Link href={href(`/products/${l.slug}?v=${l.sku}`)} className="font-display text-[22px] leading-tight font-semibold hover:underline">
                    {l.product.nameEn}
                  </Link>
                  <span className="text-sm text-muted">{l.variant.label}</span>
                  <label className="flex max-w-[440px] flex-col gap-1 pt-1 text-[13px] text-muted">
                    {q.note}
                    <input value={l.note ?? ""} onChange={(e) => shop.setQuoteNote(l.sku, e.target.value)} placeholder={q.noteExample} className="min-h-[42px] rounded-lg border border-control px-3 text-sm text-ink" />
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
                    <span className="rounded-full bg-pending-bg px-3 py-1 text-sm font-semibold text-pending">{q.awaitingPrice}</span>
                  )}
                  <QtyStepper value={l.qty} onChange={(n) => shop.setQuoteQty(l.sku, n)} label={fmt(q.qtyOf, { name: l.product.nameEn })} />
                  <button type="button" onClick={() => shop.removeFromQuote(l.sku)} className="min-h-9 text-sm text-muted underline underline-offset-4">
                    {q.remove}
                  </button>
                </div>
              </div>
            ))}
            <Link href={href("/products")} className="pt-[18px] font-semibold">
              {q.addMore}
            </Link>
          </section>

          {errorCount > 0 && (
            <div role="alert" className="flex items-center gap-2.5 rounded-[10px] bg-[#fde8e9] px-[18px] py-4 font-semibold text-[#c8101a]">
              <Icon name="alert" /> {fmt(q.missingFields, { n: errorCount })}
            </div>
          )}

          <Section n="01" title={q.contactSection}>
            {accountEmail ? (
              <p className="rounded-lg bg-stage px-4 py-3 text-sm text-muted">
                {q.signedInAs} <span className="font-semibold text-ink">{accountEmail}</span> {q.signedInNote}{" "}
                <Link href={href("/account")} className="font-semibold text-ink underline-offset-2 hover:underline">
                  {q.viewAccount}
                </Link>
              </p>
            ) : (
              <p className="rounded-lg bg-stage px-4 py-3 text-sm text-muted">
                {q.wantAutoEmail}{" "}
                <Link href={href(`/login?next=${encodeURIComponent(href("/quote"))}`)} className="font-semibold text-ink underline-offset-2 hover:underline">
                  {q.signInGoogle}
                </Link>
              </p>
            )}
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label={q.contactName} error={errors.name ? q.contactNameError : undefined}>
                <input name="contact_name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={errors.name} className={`${input} ${errors.name ? "border-2 border-[#c8101a]" : ""}`} />
              </Field>
              <Field label={q.company} optional>
                <input name="company" autoComplete="organization" className={input} />
              </Field>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-2 text-sm font-semibold">{q.preferredChannel}</legend>
              <div className="flex flex-wrap gap-2">
                {methodIds.map((id) => (
                  <label key={id} className={`inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full border px-4 text-[15px] font-medium ${method === id ? "border-ink bg-ink text-white" : "border-[#d6d2cb] bg-white"}`}>
                    <input type="radio" name="contact_method" value={id} checked={method === id} onChange={() => setMethod(id)} className="size-[18px] accent-white" />
                    {q.methods[id].label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label={m.field} error={errors.contact ? fmt(q.contactError, { field: m.field }) : undefined}>
                <input name="contact_value" value={contact} onChange={(e) => setContact(e.target.value)} aria-invalid={errors.contact} className={`${input} ${errors.contact ? "border-2 border-[#c8101a]" : ""}`} />
              </Field>
            </div>
          </Section>

          <Section n="02" title={q.destinationSection}>
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label={q.country} hint={q.countryHint}>
                <select name="country" className={input}>
                  {destinationCountries.map((c, i) => (
                    <option key={c} value={c}>
                      {q.countries[i] ?? c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={q.city} error={errors.city ? q.cityError : undefined}>
                <input name="city" value={city} onChange={(e) => setCity(e.target.value)} aria-invalid={errors.city} className={`${input} ${errors.city ? "border-2 border-[#c8101a]" : ""}`} />
              </Field>
              <Field label={q.postcode} optional>
                <input name="postcode" inputMode="numeric" className={input} />
              </Field>
            </div>
            <fieldset className="flex flex-wrap gap-2">
              <legend className="pb-2 text-sm font-semibold">{q.installQuestion}</legend>
              {[["yes", q.installYes], ["no", q.installNo], ["unsure", q.installUnsure]].map(([value, label], i) => (
                <label key={value} className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full border border-[#d6d2cb] bg-white px-4 text-[15px] has-[:checked]:border-ink">
                  <input type="radio" name="installation" value={value} defaultChecked={i === 0} className="size-[18px] accent-ink" />
                  {label}
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col gap-1.5 rounded-xl bg-stage px-[22px] py-5">
              <span className="font-semibold">
                {q.accessTitle} <span className="text-sm font-normal text-muted">{q.accessNote}</span>
              </span>
              <div className="grid gap-x-[18px] md:grid-cols-2">
                {[["access_upper_floor", q.accessUpper], ["access_lift", q.accessLift], ["access_stairs", q.accessStairs], ["access_truck", q.accessTruck]].map(([field, label]) => (
                  <label key={field} className="flex min-h-[42px] items-center gap-2.5">
                    <input type="checkbox" name={field} className="size-[18px] accent-ink" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section n="03" title={q.moreSection} note={t.common.optional}>
            <div className="grid gap-[18px] md:grid-cols-2">
              <Field label={q.targetDate}>
                <input type="date" name="target_date" className={input} />
              </Field>
              <Field label={q.budget}>
                <input name="budget" placeholder={q.budgetExample} className={input} />
              </Field>
            </div>
            <Field label={q.attachment} hint={q.attachmentHint}>
              <input type="file" name="attachment" accept=".pdf,image/jpeg,image/png,image/webp,image/heic" className="min-h-16 rounded-[10px] border-[1.5px] border-dashed border-control bg-white p-[18px] text-sm" />
            </Field>
            <Field label={q.message}>
              <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder={q.messageExample} className={`${input} py-3`} />
            </Field>
          </Section>
        </div>

        <aside aria-label={q.summary} className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px] rounded-[18px] bg-night p-6 text-white sm:p-8 lg:sticky lg:top-[108px]">
          <span className="font-display text-[26px] font-bold">{q.summary}</span>
          <div className="flex flex-col">
            <SumRow label={fmt(q.pricedItems, { n: priced.length })} value={formatMoney(subtotal, currency)} />
            <SumRow label={fmt(q.unpricedItems, { n: lines.length - priced.length })} value={q.awaitingPrice} pending />
            <SumRow label={q.shipping} value={q.shippingValue} pending />
            <SumRow label={q.installFee} value={q.toBeAssessed} pending />
            <SumRow label={fmt(q.vat, { rate: Math.round(VAT_RATE * 100) })} value={formatMoney(Math.round(subtotal * VAT_RATE), currency)} />
            <SumRow label={q.importDuty} value={q.toBeAssessed} pending />
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-night">{q.estimate}</span>
            <span className="font-display text-[34px] font-bold tabular-nums">{formatMoney(Math.round(subtotal * (1 + VAT_RATE)), currency)}+</span>
          </div>
          <span className="text-[13px] text-muted-night">{q.estimateNote}</span>
          {sendError && (
            <span role="alert" className="flex items-center gap-2 rounded-lg bg-[#3a1416] px-4 py-3 text-[15px] font-semibold text-[#ff5a61]">
              <Icon name="alert" className="shrink-0" /> {sendError}
            </span>
          )}
          <button type="submit" disabled={sending} className="glow-ring relative min-h-[60px] rounded-lg bg-brand font-display text-[19px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {sending ? q.sending : advisoryOnly ? q.submitAdvice : q.submit}
          </button>
          <span className="flex gap-2 text-[13px] text-[#d8d3cc]">
            <Icon name="check" className="shrink-0 text-[#3ecf6e]" />
            {q.noCharge}
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
  const { t } = useI18n();
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      <span>
        {label} {optional && <span className="font-normal text-muted">{t.common.optional}</span>}
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
