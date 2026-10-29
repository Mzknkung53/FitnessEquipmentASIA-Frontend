"use server";

import { revalidatePath } from "next/cache";
import { canHandleQuotes, getAuthProfile } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { QuoteStatus } from "@/app/staff/quotes/quote-meta";

export type QuoteActionResult = { ok: true } | { ok: false; error: string };

const uuidRe = /^[0-9a-f-]{36}$/i;

/** Database rule codes (SQLSTATE 22023 / 42501) → messages for staff. */
function message(error: { code?: string; message: string }): string {
  const m = error.message;
  if (error.code === "42501" || m === "forbidden") return "บัญชีนี้ไม่มีสิทธิ์จัดการใบขอราคา";
  if (m === "quote_closed") return "ใบนี้ปิดไปแล้ว กด “เปิดใหม่” ก่อนแก้ราคา";
  if (m.startsWith("missing:price:")) return `ใส่ราคาให้ครบทุกรายการ (ยังขาด ${m.slice("missing:price:".length)})`;
  if (m === "invalid:price") return "ราคาต้องเป็นตัวเลขไม่ติดลบ ทศนิยมไม่เกิน 2 ตำแหน่ง";
  if (m === "missing:total") return "ใส่ยอดรวมก่อน VAT";
  if (m === "invalid:vat_rate") return "อัตรา VAT ไม่ถูกต้อง";
  if (m === "unknown_quote") return "ไม่พบใบขอราคานี้";
  if (m.startsWith("invalid_transition:")) return "เปลี่ยนสถานะแบบนี้ไม่ได้ ลองรีเฟรชหน้า";
  console.error("Quote action failed", error);
  return "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง";
}

async function guard(quoteId: string): Promise<string | null> {
  const profile = await getAuthProfile();
  if (!profile || !canHandleQuotes(profile)) return "บัญชีนี้ไม่มีสิทธิ์จัดการใบขอราคา";
  if (!uuidRe.test(quoteId)) return "ไม่พบใบขอราคานี้";
  return null;
}

function refresh(quoteId: string) {
  revalidatePath("/staff/quotes");
  revalidatePath(`/staff/quotes/${quoteId}`);
}

/** Prices every line (THB excl. VAT), sets the VAT rate, marks the request as quoted. */
export async function saveQuotation(input: {
  quoteId: string;
  lines: { id: number; price: string }[];
  vatRate: number;
  totalThb?: string;
}): Promise<QuoteActionResult> {
  const denied = await guard(input.quoteId);
  if (denied) return { ok: false, error: denied };
  if (![0, 7].includes(input.vatRate)) return { ok: false, error: "อัตรา VAT ไม่ถูกต้อง" };

  const clean = (s: string) => s.replace(/[,\s฿]/g, "");
  const lines = input.lines.map((l) => ({ id: l.id, price: clean(l.price) }));
  if (lines.some((l) => l.price === "")) return { ok: false, error: "ใส่ราคาให้ครบทุกรายการ" };

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("save_quotation", {
    p_quote_id: input.quoteId,
    p_lines: lines,
    p_vat_rate: input.vatRate,
    p_total_thb: input.totalThb != null && clean(input.totalThb) !== "" ? Number(clean(input.totalThb)) : null,
  });
  if (error) return { ok: false, error: message(error) };
  refresh(input.quoteId);
  return { ok: true };
}

const settable: QuoteStatus[] = ["reviewing", "won", "lost", "cancelled"];

export async function setQuoteStatus(quoteId: string, status: QuoteStatus, lostReason?: string): Promise<QuoteActionResult> {
  const denied = await guard(quoteId);
  if (denied) return { ok: false, error: denied };
  if (!settable.includes(status)) return { ok: false, error: "สถานะไม่ถูกต้อง" };

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("set_quote_status", {
    p_quote_id: quoteId,
    p_status: status,
    p_lost_reason: lostReason?.trim() || null,
  });
  if (error) return { ok: false, error: message(error) };
  refresh(quoteId);
  return { ok: true };
}
