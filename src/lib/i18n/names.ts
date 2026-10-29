import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/th";
import type { Category, Product } from "@/lib/types";

// Catalog names come from the database in Thai and English only; Chinese uses the
// dictionary for categories and the English product name.

export function categoryName(c: Pick<Category, "id" | "nameTh" | "nameEn">, lang: Locale, t: Dictionary): string {
  if (lang === "th") return c.nameTh;
  if (lang === "en") return c.nameEn || t.categories[c.id];
  return t.categories[c.id] ?? c.nameEn;
}

/** Second line under the product name: the Thai name on the Thai site, nothing elsewhere. */
export function productSubtitle(p: Pick<Product, "nameTh">, lang: Locale): string | null {
  return lang === "th" ? p.nameTh : null;
}
