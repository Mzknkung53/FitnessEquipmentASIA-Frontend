import { dateLocale, type Locale } from "@/lib/i18n/config";
import type { ContactMethod } from "@/lib/types";

export type QuoteStatus = "new" | "reviewing" | "quoted" | "won" | "lost" | "cancelled";

/** Badge colours per status; the label is t.quoteStatus[status]. */
export const quoteStatusCls: Record<QuoteStatus, string> = {
  new: "bg-brand text-white",
  reviewing: "bg-[#2a2010] text-[#e3b25a]",
  quoted: "bg-[#15202f] text-[#8db8f0]",
  won: "bg-[#16261c] text-[#6cc28d]",
  lost: "bg-[#262422] text-[#bdb6ad]",
  cancelled: "bg-[#262422] text-muted-night",
};

/** Thai channel names for the staff notification; the staff pages use t.contact. */
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

/** Formatted on the server only, so the browser's time zone can't cause a mismatch. */
export function formatDateTime(iso: string, lang: Locale = "th") {
  return new Intl.DateTimeFormat(dateLocale[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(iso));
}
