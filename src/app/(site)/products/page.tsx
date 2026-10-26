import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductBrowser } from "@/app/(site)/products/product-browser";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "สินค้าทั้งหมด" };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <section className="bg-stage">
        <div className="wrap flex flex-col gap-3 pt-12 pb-4">
          <nav aria-label="เส้นทาง" className="text-sm text-muted">
            <Link href="/" className="underline">หน้าแรก</Link> / สินค้าทั้งหมด
          </nav>
        </div>
      </section>
      <Suspense fallback={<div className="wrap py-24 text-muted">กำลังโหลดสินค้า…</div>}>
        <ProductBrowser products={products} categories={categories} />
      </Suspense>
    </>
  );
}
