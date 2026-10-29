import "server-only";
import { randomUUID } from "node:crypto";
import type { Dictionary } from "@/lib/i18n/th";
import { serviceClient } from "@/lib/supabase";

// Shared server-side pieces of the quote and service-request actions.

export type SubmitResult =
  | { ok: true; reference: string; attachmentFailed?: boolean }
  | { ok: false; error: string };

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

const extensions: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

export function text(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

/** A non-empty uploaded file, or undefined when the field was left blank. */
export function file(form: FormData, key: string): File | undefined {
  const v = form.get(key);
  return v instanceof File && v.size > 0 ? v : undefined;
}

/** Checked before anything is saved, so a bad file never leaves a half-made request. */
export function attachmentError(f: File | undefined, allowed: string[], msg: Dictionary["submit"]): string | undefined {
  if (!f) return undefined;
  if (!allowed.includes(f.type)) return msg.fileType;
  if (f.size > MAX_ATTACHMENT_BYTES) return msg.fileSize;
  return undefined;
}

/** Turns the database's validation codes (SQLSTATE 22023) into a message for the customer. */
export function dbErrorMessage(error: { code?: string; message: string }, msg: Dictionary["submit"]): string {
  if (error.code === "22023") {
    if (error.message.startsWith("unknown_sku:")) return msg.unknownSku;
    if (error.message.startsWith("missing:") || error.message.startsWith("invalid:")) return msg.invalid;
    if (error.message.startsWith("too_long:")) return msg.tooLong;
  }
  console.error("Supabase error", error);
  return msg.failed;
}

/**
 * Uploads a customer file to a private bucket and links it to the request.
 * Returns false on failure; the request itself is already saved by then.
 */
export async function attachFile(bucket: "quote-attachments", reference: string, f: File): Promise<boolean> {
  const supabase = serviceClient();
  const path = `${reference}/${randomUUID()}.${extensions[f.type] ?? "bin"}`;
  const upload = await supabase.storage.from(bucket).upload(path, f, { contentType: f.type });
  if (upload.error) {
    console.error("Attachment upload failed", reference, upload.error);
    return false;
  }
  const { error } = await supabase.rpc("register_attachment", {
    p_reference: reference,
    p_bucket: bucket,
    p_storage_path: path,
    p_mime_type: f.type,
    p_size_bytes: f.size,
  });
  if (error) {
    console.error("Attachment registration failed", reference, error);
    return false;
  }
  return true;
}
