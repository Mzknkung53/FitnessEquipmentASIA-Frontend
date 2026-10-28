import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteClient } from "@/app/(site)/quote/quote-client";
import { getAuthProfile } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "รายการขอราคา" };

export default async function QuotePage() {
  const [products, profile] = await Promise.all([getProducts(), getAuthProfile()]);
  return (
    <Suspense fallback={<div className="wrap py-24 text-muted">กำลังโหลดรายการขอราคา…</div>}>
      <QuoteClient
        products={products}
        accountEmail={profile?.email ?? null}
        accountName={profile?.displayName ?? null}
      />
    </Suspense>
  );
}
