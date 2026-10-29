import "server-only";
import { cookies } from "next/headers";
import { isLocale, LANG_COOKIE, type Locale } from "@/lib/i18n/config";
import { staffEn } from "@/lib/i18n/staff-en";
import { staffTh, type StaffDictionary } from "@/lib/i18n/staff-th";
import { staffZh } from "@/lib/i18n/staff-zh";

const dictionaries: Record<Locale, StaffDictionary> = { th: staffTh, en: staffEn, zh: staffZh };

/** Staff pages have no language in the URL: they follow the language cookie (Thai by default). */
export async function getStaffI18n(): Promise<{ lang: Locale; t: StaffDictionary }> {
  const value = (await cookies()).get(LANG_COOKIE)?.value ?? "";
  const lang = isLocale(value) ? value : "th";
  return { lang, t: dictionaries[lang] };
}
