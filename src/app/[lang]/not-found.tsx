"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";

// A missing product or page inside the storefront: keeps the header and footer in the visitor's language.
export default function SiteNotFound() {
  const { t, href } = useI18n();
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-5 bg-stage px-4 py-24 text-center">
      <span className="hollow font-display text-[140px] leading-none font-bold text-ink">404</span>
      <h1 className="font-display text-4xl font-bold">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.body}</p>
      <Link href={href("/products")} className="inline-flex min-h-14 items-center rounded-md bg-brand px-7 font-display text-lg font-semibold text-white">
        {t.common.seeAllProducts}
      </Link>
    </section>
  );
}
