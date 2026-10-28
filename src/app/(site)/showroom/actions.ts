"use server";

import { attachFile, attachmentError, dbErrorMessage, file, text, type SubmitResult } from "@/lib/form-submit";
import { serviceClient, supabaseConfigured } from "@/lib/supabase";

const allowedFiles = ["image/jpeg", "image/png", "image/webp", "image/heic", "video/mp4", "video/quicktime"];

/** Saves a repair / service request through the database function submit_service_request. */
export async function submitServiceRequest(form: FormData): Promise<SubmitResult> {
  if (!supabaseConfigured) return { ok: false, error: "ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล (ตั้งค่า .env.local)" };

  const attachment = file(form, "attachment");
  const fileError = attachmentError(attachment, allowedFiles);
  if (fileError) return { ok: false, error: fileError };

  const { data, error } = await serviceClient().rpc("submit_service_request", {
    payload: {
      product_model: text(form, "product_model"),
      unit_code: text(form, "unit_code"),
      symptom: text(form, "symptom"),
      contact_value: text(form, "contact_value"),
    },
  });
  if (error) return { ok: false, error: dbErrorMessage(error) };

  const reference = (data as { reference: string }).reference;
  const attached = attachment ? await attachFile("service-attachments", reference, attachment) : true;
  return { ok: true, reference, attachmentFailed: !attached };
}
