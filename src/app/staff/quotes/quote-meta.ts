import type { ContactMethod } from "@/lib/types";

export type QuoteStatus = "new" | "reviewing" | "quoted" | "won" | "lost" | "cancelled";

export const quoteStatusMeta: Record<QuoteStatus, { label: string; cls: string }> = {
  new: { label: "ใหม่", cls: "bg-brand text-white" },
  reviewing: { label: "กำลังดำเนินการ", cls: "bg-[#2a2010] text-[#e3b25a]" },
  quoted: { label: "ส่งราคาแล้ว", cls: "bg-[#15202f] text-[#8db8f0]" },
  won: { label: "ปิดการขายได้", cls: "bg-[#16261c] text-[#6cc28d]" },
  lost: { label: "ไม่สำเร็จ", cls: "bg-[#262422] text-[#bdb6ad]" },
  cancelled: { label: "ยกเลิก", cls: "bg-[#262422] text-muted-night" },
};

export const contactLabel: Record<ContactMethod, string> = {
  line: "LINE",
  wechat: "WeChat",
  whatsapp: "WhatsApp",
  phone: "โทรศัพท์",
  email: "อีเมล",
};

/** A link that opens the customer's channel directly, where one exists. */
export function contactHref(method: ContactMethod, value: string): string | null {
  const v = value.trim();
  if (method === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (method === "email") return `mailto:${v}`;
  if (method === "whatsapp") return `https://wa.me/${v.replace(/\D/g, "")}`;
  if (method === "line") return `https://line.me/R/ti/p/~${encodeURIComponent(v.replace(/^@?/, ""))}`;
  return null;
}

const dateTime = new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});

/** Formatted on the server only, so the browser's time zone can't cause a mismatch. */
export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}
