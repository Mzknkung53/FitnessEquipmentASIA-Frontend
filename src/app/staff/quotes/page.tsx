import { Suspense } from "react";
import { QuoteList, type QuoteRow } from "@/app/staff/quotes/quote-list";
import { formatDateTime, type QuoteStatus } from "@/app/staff/quotes/quote-meta";
import { requireStaff, StaffHeader } from "@/app/staff/staff-header";
import { canHandleQuotes } from "@/lib/auth";
import { formatMoney } from "@/lib/pricing";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ContactMethod } from "@/lib/types";

export const metadata = { title: "ใบขอราคา" };

export default function QuotesPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted-night">กำลังโหลด…</div>}>
      <Quotes />
    </Suspense>
  );
}

type OverviewRow = {
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
  quoted_grand_total_thb: number | null;
  item_count: number;
  attachment_count: number;
  list_total_thb: number | null;
  unpriced_items: number;
  assigned_to_me: boolean | null;
};

async function Quotes() {
  const profile = await requireStaff();
  if (!canHandleQuotes(profile)) {
    return (
      <>
        <StaffHeader profile={profile} active="quotes" />
        <main className="page-enter mx-auto max-w-[1100px] px-4 py-16 text-muted-night sm:px-6">ใบขอราคาเปิดดูได้เฉพาะฝ่ายขายและผู้ดูแลระบบ</main>
      </>
    );
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("quote_overview").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(`Loading quotes failed: ${error.message}`);

  const rows: QuoteRow[] = (data as OverviewRow[]).map((q) => ({
    id: q.id,
    reference: q.reference,
    status: q.status,
    createdAt: formatDateTime(q.created_at),
    who: q.company ? `${q.contact_name} · ${q.company}` : q.contact_name,
    where: q.country === "ไทย" ? q.city : `${q.city}, ${q.country}`,
    items: q.item_count,
    attachments: q.attachment_count,
    mine: Boolean(q.assigned_to_me),
    amount:
      q.quoted_grand_total_thb != null
        ? formatMoney(q.quoted_grand_total_thb)
        : q.item_count === 0
          ? "ขอคำแนะนำ"
          : q.list_total_thb != null && q.unpriced_items === 0
            ? `ราคาเว็บ ${formatMoney(q.list_total_thb)}`
            : "รอเสนอราคา",
    quoted: q.quoted_grand_total_thb != null,
    search: [q.reference, q.contact_name, q.company, q.contact_value, q.city, q.country].filter(Boolean).join(" ").toLowerCase(),
  }));

  return (
    <>
      <StaffHeader profile={profile} active="quotes" />
      <main className="page-enter mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-4xl font-bold">ใบขอราคา</h1>
          <p className="text-sm text-muted-night">คำขอจากหน้าเว็บ · กดที่รายการเพื่อใส่ราคาและเปลี่ยนสถานะ</p>
        </div>
        <QuoteList rows={rows} />
      </main>
    </>
  );
}
