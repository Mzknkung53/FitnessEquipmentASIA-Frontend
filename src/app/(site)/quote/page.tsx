import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteClient } from "@/app/(site)/quote/quote-client";
import { getAuthProfile } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "รายการขอราคา" };

export default async function QuotePage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="wrap py-24 text-muted">กำลังโหลดรายการขอราคา…</div>}>
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
