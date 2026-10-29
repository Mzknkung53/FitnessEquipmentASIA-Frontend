"use server";

import { after } from "next/server";
import { attachFile, attachmentError, dbErrorMessage, file, text, type SubmitResult } from "@/lib/form-submit";
import { contactLabel } from "@/app/staff/quotes/quote-meta";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { notifyStaff, siteUrl } from "@/lib/notify";
import { serviceClient, supabaseConfigured } from "@/lib/supabase";
import type { ContactMethod } from "@/lib/types";

const allowedFiles = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

/**
 * Saves a quote request through the database function submit_quote_request.
 * Public endpoint: anyone can POST here, so everything is re-checked on the server
 * and again by the database. It never charges money or reserves stock.
 */
export async function submitQuoteRequest(form: FormData): Promise<SubmitResult> {
  // Replies in the customer's language; the staff notification stays in Thai.
  const lang = text(form, "lang") ?? "th";
  const msg = getDictionary(isLocale(lang) ? lang : "th").submit;
  if (!supabaseConfigured) return { ok: false, error: msg.notConnected };

  let items: { sku: string; qty: number; note?: string }[];
  try {
    const parsed: unknown = JSON.parse(text(form, "items") ?? "[]");
    if (!Array.isArray(parsed) || parsed.length > 100) throw new Error("bad items");
    items = parsed.map((l: { sku?: unknown; qty?: unknown; note?: unknown }) => ({
      sku: String(l.sku),
      qty: Number(l.qty),
      note: typeof l.note === "string" && l.note.trim() !== "" ? l.note.trim() : undefined,
    }));
  } catch {
    return { ok: false, error: msg.badItems };
  }

  const attachment = file(form, "attachment");
  const fileError = attachmentError(attachment, allowedFiles, msg);
  if (fileError) return { ok: false, error: fileError };

  const { data, error } = await serviceClient().rpc("submit_quote_request", {
    payload: {
      contact_name: text(form, "contact_name"),
      company: text(form, "company"),
      contact_method: text(form, "contact_method"),
      contact_value: text(form, "contact_value"),
      country: text(form, "country"),
      city: text(form, "city"),
      postcode: text(form, "postcode"),
      installation: text(form, "installation"),
      access: {
        upper_floor: form.has("access_upper_floor"),
        lift: form.has("access_lift"),
        stairs: form.has("access_stairs"),
        truck_access: form.has("access_truck"),
      },
      target_date: text(form, "target_date"),
      budget: text(form, "budget"),
      message: text(form, "message"),
      source: "web",
      items,
    },
  });
  if (error) return { ok: false, error: dbErrorMessage(error, msg) };

  const { id, reference } = data as { id: string; reference: string };
  const attached = attachment ? await attachFile("quote-attachments", reference, attachment) : true;

  // Tell the team once the customer already has their reference.
  const link = `${await siteUrl()}/staff/quotes/${id}`;
  const who = [text(form, "contact_name"), text(form, "company")].filter(Boolean).join(" · ");
  after(() =>
    notifyStaff({
      title: `📋 ใบขอราคาใหม่ ${reference}`,
      lines: [
        who,
        `ติดต่อ: ${contactLabel[text(form, "contact_method") as ContactMethod] ?? ""} ${text(form, "contact_value") ?? ""}`,
        `ปลายทาง: ${[text(form, "city"), text(form, "country")].filter(Boolean).join(", ")}`,
        items.length > 0 ? `สินค้า ${items.length} รายการ` : "ขอคำแนะนำจัดชุดยิม (ไม่ได้เลือกสินค้า)",
        ...(attachment ? [attached ? "มีไฟล์แนบ" : "ไฟล์แนบอัปโหลดไม่สำเร็จ"] : []),
      ],
      link,
    }),
  );
  return { ok: true, reference, attachmentFailed: !attached };
}
