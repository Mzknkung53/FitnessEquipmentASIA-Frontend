"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { LANG_COOKIE, localeLabel, locales, type Locale } from "@/lib/i18n/config";
import type { StaffDictionary } from "@/lib/i18n/staff-th";

// Each staff page reads the language cookie on the server and passes the dictionary here.

const StaffI18nContext = createContext<{ lang: Locale; t: StaffDictionary } | null>(null);

export function StaffI18nProvider({ lang, t, children }: { lang: Locale; t: StaffDictionary; children: React.ReactNode }) {
  return <StaffI18nContext.Provider value={{ lang, t }}>{children}</StaffI18nContext.Provider>;
}

export function useStaffI18n() {
  const ctx = useContext(StaffI18nContext);
  if (!ctx) throw new Error("useStaffI18n must be used inside a staff page");
  return ctx;
}

/** TH / EN / 中文 for the staff area: saves the choice in the cookie and re-renders the page. */
export function StaffLangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const router = useRouter();
  return (
    <span className="flex gap-0.5" role="group" aria-label={label}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === lang}
          onClick={() => {
            document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
            router.refresh();
          }}
          className={`rounded px-1.5 py-0.5 text-xs ${l === lang ? "font-semibold text-white" : "text-muted-night hover:text-white"}`}
        >
          {localeLabel[l]}
        </button>
      ))}
    </span>
  );
}
