import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductBrowser } from "@/app/[lang]/products/product-browser";
import { getCategories, getProducts } from "@/lib/catalog";
import { langFrom } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { t } = await langFrom(params);
  return { title: t.meta.products };
}

export default async function ProductsPage({ params }: PageProps<"/[lang]/products">) {
  const { lang, t } = await langFrom(params);
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <section className="bg-stage">
        <div className="wrap flex flex-col gap-3 pt-12 pb-4">
          <nav aria-label={t.common.breadcrumb} className="text-sm text-muted">
            <Link href={localePath(lang, "/")} className="underline">{t.common.home}</Link> / {t.products.allProducts}
          </nav>
        </div>
      </section>
      <Suspense fallback={<div className="wrap py-24 text-muted">{t.products.loading}</div>}>
        <ProductBrowser products={products} categories={categories} />
      </Suspense>
    </>
  );
}
