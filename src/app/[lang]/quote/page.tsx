import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteClient } from "@/app/[lang]/quote/quote-client";
import { getAuthProfile } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import { langFrom } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/quote">): Promise<Metadata> {
  const { t } = await langFrom(params);
  return { title: t.meta.quote };
}

export default async function QuotePage({ params }: PageProps<"/[lang]/quote">) {
  const { t } = await langFrom(params);
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="wrap py-24 text-muted">{t.quote.loading}</div>}>
      <QuoteWithAuth products={products} />
    </Suspense>
  );
}

async function QuoteWithAuth({ products }: { products: Product[] }) {
  const profile = await getAuthProfile();
  return (
    <QuoteClient
      products={products}
      accountEmail={profile?.email ?? null}
      accountName={profile?.displayName ?? null}
    />
  );
}
