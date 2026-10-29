import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuoteActions } from "@/app/staff/quotes/[id]/quote-actions";
import { QuotePricing } from "@/app/staff/quotes/[id]/quote-pricing";
import { contactHref, formatDateTime, quoteStatusCls, type QuoteStatus } from "@/app/staff/quotes/quote-meta";
import { requireStaff, StaffHeader } from "@/app/staff/staff-header";
import { isMissingMigration, MigrationNeeded } from "@/app/staff/staff-notice";
import { PageTransition } from "@/components/page-transition";
import { Icon } from "@/components/icons";
import { canHandleQuotes } from "@/lib/auth";
import { StaffI18nProvider } from "@/app/staff/staff-i18n";
import { fmt } from "@/lib/i18n/config";
import { getStaffI18n } from "@/lib/i18n/staff";
import { destinationCountries } from "@/lib/site";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ContactMethod } from "@/lib/types";

export const metadata = { title: "ใบขอราคา" };

type QuoteRecord = {
  id: string;
  reference: string;
  created_at: string;
  status: QuoteStatus;
  contact_name: string;
  company: string | null;
  contact_method: ContactMethod;
  contact_value: string;
  country: string;
  city: string;
  postcode: string | null;
  installation: "yes" | "no" | "unsure";
  access_upper_floor: boolean;
  access_lift: boolean;
  access_stairs: boolean;
  access_truck: boolean;
  target_date: string | null;
  budget_text: string | null;
  message: string | null;
  quoted_total_thb: number | null;
  vat_rate: number;
  quoted_at: string | null;
  closed_at: string | null;
  lost_reason: string | null;
};

type ItemRecord = {
  id: number;
  sku: string;
  qty: number;
  note: string | null;
  list_price_thb: number | null;
  quoted_unit_price_thb: number | null;
  variant_label: string;
  name_th: string;
  model: string;
  slug: string;
};

type AttachmentRecord = { id: string; bucket: string; storage_path: string; mime_type: string; size_bytes: number };

export default function QuotePage({ params }: PageProps<"/staff/quotes/[id]">) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted-night">…</div>}>
      <Quote params={params} />
    </Suspense>
  );
}

async function Quote({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, profile, { lang, t }] = await Promise.all([params, requireStaff(), getStaffI18n()]);
  const d = t.detail;
  if (!canHandleQuotes(profile) || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createServerSupabase();
  const [{ data: quote }, { data: items, error: itemsError }, { data: files }] = await Promise.all([
    supabase.from("quote_requests").select("*").eq("id", id).maybeSingle(),
    supabase.from("quote_item_detail").select("*").eq("quote_id", id).order("id"),
    supabase.from("attachments").select("id, bucket, storage_path, mime_type, size_bytes").eq("quote_id", id),
  ]);
  if (itemsError && isMissingMigration(itemsError)) {
    return (
      <>
        <StaffHeader profile={profile} active="quotes" />
        <MigrationNeeded file="20261029001000_quotation_workflow.sql" />
      </>
    );
  }
  if (!quote) notFound();
  const q = quote as QuoteRecord;

  // Private bucket: short-lived links, created with the staff member's own session.
  const attachments = await Promise.all(
    ((files ?? []) as AttachmentRecord[]).map(async (f) => {
      const { data } = await supabase.storage.from(f.bucket).createSignedUrl(f.storage_path, 60 * 30);
      return { ...f, url: data?.signedUrl ?? null };
    }),
  );

  const href = contactHref(q.contact_method, q.contact_value);
  const access = [
    q.access_upper_floor && d.accessUpper,
    q.access_lift && d.accessLift,
    q.access_stairs && d.accessStairs,
    q.access_truck && d.accessTruck,
  ].filter(Boolean) as string[];
  const country = t.countries[destinationCountries.indexOf(q.country)] ?? q.country;
  const closed = ["won", "lost", "cancelled"].includes(q.status);

  return (
    <StaffI18nProvider lang={lang} t={t}>
      <StaffHeader profile={profile} active="quotes" />
      <PageTransition>
        <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pt-6 pb-16 sm:px-6">
        <Link href="/staff/quotes" className="inline-flex items-center gap-1.5 self-start text-sm text-muted-night hover:text-white">
          <Icon name="arrowLeft" size={14} /> {d.back}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${quoteStatusCls[q.status]}`}>{t.quoteStatus[q.status]}</span>
              <span className="text-sm text-muted-night">{fmt(d.sentAt, { date: formatDateTime(q.created_at, lang) })}</span>
            </span>
            <h1 className="font-mono text-3xl font-bold sm:text-4xl">{q.reference}</h1>
          </div>
          <QuoteActions quoteId={q.id} status={q.status} />
        </div>
        {q.status === "lost" && q.lost_reason && <p className="rounded-lg bg-[#262422] px-4 py-3 text-sm">{fmt(d.lostReason, { reason: q.lost_reason })}</p>}

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <QuotePricing
            quoteId={q.id}
            reference={q.reference}
            customer={q.contact_name}
            closed={closed}
            vatRate={q.quoted_total_thb != null ? Number(q.vat_rate) : q.country === "ไทย" ? 7 : 0}
            totalThb={q.quoted_total_thb != null ? String(q.quoted_total_thb) : ""}
            quotedAt={q.quoted_at ? formatDateTime(q.quoted_at, lang) : null}
            items={((items ?? []) as ItemRecord[]).map((i) => ({
              id: i.id,
              sku: i.sku,
              name: i.name_th,
              variant: i.variant_label,
              slug: i.slug,
              qty: i.qty,
              note: i.note,
              listPrice: i.list_price_thb,
              quotedPrice: i.quoted_unit_price_thb,
            }))}
          />

          <aside className="flex flex-col gap-4">
            <Card title={d.customer}>
              <p className="text-lg font-semibold">{q.contact_name}</p>
              {q.company && <p className="text-muted-night">{q.company}</p>}
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted-night">{t.contact[q.contact_method]}:</span>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="font-semibold underline-offset-2 hover:underline">
                    {q.contact_value}
                  </a>
                ) : (
                  <span className="font-semibold">{q.contact_value}</span>
                )}
              </p>
            </Card>

            <Card title={d.destinationCard}>
              <Row label={d.destination} value={[q.city, q.postcode, country].filter(Boolean).join(" ")} />
              <Row label={d.install} value={d.installation[q.installation]} />
              {access.length > 0 && <Row label={d.access} value={access.join(" · ")} />}
              {q.target_date && <Row label={d.targetDate} value={q.target_date} />}
              {q.budget_text && <Row label={d.budget} value={q.budget_text} />}
            </Card>

            {q.message && (
              <Card title={d.message}>
                <p className="whitespace-pre-line">{q.message}</p>
              </Card>
            )}

            <Card title={fmt(d.attachments, { n: attachments.length })}>
              {attachments.length === 0 ? (
                <p className="text-muted-night">{d.noAttachments}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {attachments.map((a, n) => (
                    <li key={a.id}>
                      {a.url ? (
                        <a href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold underline-offset-2 hover:underline">
                          <Icon name={a.mime_type.startsWith("image/") ? "image" : "arrowUpRight"} size={16} />
                          {fmt(d.file, { n: n + 1 })} · {a.mime_type === "application/pdf" ? "PDF" : a.mime_type.split("/")[1].toUpperCase()} · {fileSize(a.size_bytes)}
                        </a>
                      ) : (
                        <span className="text-muted-night">{d.cantOpen}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        </div>
        </main>
      </PageTransition>
    </StaffI18nProvider>
  );
}

/** KB under 1 MB, so a small PDF doesn't read as "0.0 MB". */
function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-[#26231f] bg-night-2 p-5 text-[15px]">
      <h2 className="text-sm font-semibold text-muted-night">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-3">
      <span className="w-24 shrink-0 text-muted-night">{label}</span>
      <span>{value}</span>
    </p>
  );
}
