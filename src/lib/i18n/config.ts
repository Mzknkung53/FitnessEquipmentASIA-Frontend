// Storefront languages. Thai is the default and has no URL prefix (/products);
// the others live under /en and /zh. src/proxy.ts rewrites unprefixed URLs to /th
// internally and sends /th/... back to the unprefixed address.

export const locales = ["th", "en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "th";

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** Value for the lang attribute (Chinese is written in Simplified characters). */
export const htmlLang: Record<Locale, string> = { th: "th", en: "en", zh: "zh-Hans" };

/** Label on the language switch. */
export const localeLabel: Record<Locale, string> = { th: "TH", en: "EN", zh: "中文" };

/** "/products" in the given language: /products, /en/products, /zh/products. */
export function localePath(lang: Locale, path: string): string {
  if (!path.startsWith("/")) return path;
  if (lang === defaultLocale) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Drops a language prefix: "/en/products" → "/products", "/th" → "/". */
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(th|en|zh)(?=\/|$)/);
  if (!m) return pathname || "/";
  return pathname.slice(m[0].length) || "/";
}

/** Fills {name} placeholders: fmt("{n} items", { n: 3 }). */
export function fmt(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** Last storefront language the visitor used (set by src/proxy.ts); the staff area follows it. */
export const LANG_COOKIE = "fea-lang";

/** Locale for dates and times. */
export const dateLocale: Record<Locale, string> = { th: "th-TH-u-ca-gregory", en: "en-GB", zh: "zh-CN" };
