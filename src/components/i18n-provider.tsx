"use client";

import { createContext, useContext } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/th";

// The storefront layout passes the current language and its dictionary once;
// client components read them here instead of importing every language.

const I18nContext = createContext<{ lang: Locale; t: Dictionary } | null>(null);

export function I18nProvider({ lang, t, children }: { lang: Locale; t: Dictionary; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ lang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside the storefront layout");
  return { ...ctx, href: (path: string) => localePath(ctx.lang, path) };
}
