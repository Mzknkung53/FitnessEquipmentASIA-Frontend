import "server-only";
import { notFound } from "next/navigation";
import { en } from "@/lib/i18n/en";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { th, type Dictionary } from "@/lib/i18n/th";
import { zh } from "@/lib/i18n/zh";

const dictionaries: Record<Locale, Dictionary> = { th, en, zh };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** Reads [lang] from route params; anything that is not a storefront language is a 404. */
export async function langFrom(params: Promise<{ lang: string }>): Promise<{ lang: Locale; t: Dictionary }> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { lang, t: dictionaries[lang] };
}
