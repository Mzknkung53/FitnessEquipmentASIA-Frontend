import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteClient } from "@/app/(site)/quote/quote-client";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "รายการขอราคา" };

export default async function QuotePage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="wrap py-24 text-muted">กำลังโหลดรายการขอราคา…</div>}>
      <QuoteClient products={products} />
    </Suspense>
  );
}
