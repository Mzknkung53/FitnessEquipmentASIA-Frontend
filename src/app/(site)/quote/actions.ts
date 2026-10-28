"use server";

import { attachFile, attachmentError, dbErrorMessage, file, text, type SubmitResult } from "@/lib/form-submit";
import { serviceClient, supabaseConfigured } from "@/lib/supabase";

const allowedFiles = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

/**
 * Saves a quote request through the database function submit_quote_request.
 * Public endpoint: anyone can POST here, so everything is re-checked on the server
 * and again by the database. It never charges money or reserves stock.
 */
export async function submitQuoteRequest(form: FormData): Promise<SubmitResult> {
  if (!supabaseConfigured) return { ok: false, error: "ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล (ตั้งค่า .env.local)" };

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
    return { ok: false, error: "รายการสินค้าไม่ถูกต้อง กรุณาโหลดหน้าใหม่" };
  }

  const attachment = file(form, "attachment");
  const fileError = attachmentError(attachment, allowedFiles);
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
  if (error) return { ok: false, error: dbErrorMessage(error) };

  const reference = (data as { reference: string }).reference;
  const attached = attachment ? await attachFile("quote-attachments", reference, attachment) : true;
  return { ok: true, reference, attachmentFailed: !attached };
}
