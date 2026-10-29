"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/components/i18n-provider";

// Shown inside the storefront layout (header and footer stay), so a failing page
// never leaves the visitor on a dead end.
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const { t, href } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="wrap flex min-h-[60vh] flex-col items-start justify-center gap-5 py-24">
      <span className="eyebrow text-brand">{t.error.eyebrow}</span>
      <h1 className="font-display text-[clamp(32px,5vw,48px)] leading-tight font-bold">{t.error.title}</h1>
      <p className="max-w-[560px] text-muted">{t.error.body}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="inline-flex min-h-12 items-center rounded-md bg-brand px-6 font-semibold text-white hover:bg-brand-dark">
          {t.error.retry}
        </button>
        <Link href={href("/")} className="inline-flex min-h-12 items-center rounded-md border-[1.5px] border-ink px-6 font-semibold">
          {t.error.home}
        </Link>
      </div>
    </section>
  );
}
