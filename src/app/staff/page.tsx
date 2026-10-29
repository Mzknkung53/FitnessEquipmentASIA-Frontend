import Link from "next/link";
import { Suspense } from "react";
import { StaffProductList, type StaffProductRow } from "@/app/staff/product-list";
import { requireStaff, StaffHeader } from "@/app/staff/staff-header";
import { PageTransition } from "@/components/page-transition";
import { Icon } from "@/components/icons";
import { getCategories } from "@/lib/catalog";
import { StaffI18nProvider } from "@/app/staff/staff-i18n";
import { fmt } from "@/lib/i18n/config";
import { getStaffI18n } from "@/lib/i18n/staff";
import { formatMoney } from "@/lib/pricing";
import { productMediaUrl } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted-night">…</div>}>
      <StaffProducts />
    </Suspense>
  );
}

type Row = {
  slug: string;
  model: string;
  name_th: string;
  name_en: string;
  status: "draft" | "published" | "archived";
  category_id: string;
  variants: { price_thb: number | null }[];
  product_media: { kind: string; storage_path: string | null; sort: number }[];
};

async function StaffProducts() {
  const profile = await requireStaff();
  const { lang, t } = await getStaffI18n();
  const p = t.products;
  const supabase = await createServerSupabase();
  const [{ data }, categories] = await Promise.all([
    supabase
      .from("products")
      .select("slug, model, name_th, name_en, status, category_id, variants(price_thb), product_media(kind, storage_path, sort)")
      .order("created_at", { ascending: false })
      .limit(200),
    getCategories(),
  ]);

  const categoryName = new Map<string, string>(
    categories.map((c) => [c.id, lang === "th" ? c.nameTh : lang === "en" ? c.nameEn : (t.categories[c.id] ?? c.nameEn)]),
  );
  const products: StaffProductRow[] = ((data ?? []) as Row[]).map((r) => {
    const prices = r.variants.map((v) => v.price_thb).filter((n): n is number => n != null);
    const photo = r.product_media.filter((m) => m.kind === "image" && m.storage_path).sort((a, b) => a.sort - b.sort)[0];
    return {
      slug: r.slug,
      code: r.model,
      nameTh: r.name_th,
      nameEn: r.name_en,
      status: r.status,
      category: categoryName.get(r.category_id) ?? r.category_id,
      price: prices.length === 0 ? p.askPrice : prices.length === 1 ? formatMoney(prices[0]) : fmt(p.priceFrom, { price: formatMoney(Math.min(...prices)) }),
      thumb: photo ? productMediaUrl(photo.storage_path!) : null,
    };
  });

  return (
    <StaffI18nProvider lang={lang} t={t}>
      <StaffHeader profile={profile} active="products" />
      <PageTransition>
        <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-4xl font-bold">{p.title}</h1>
            <p className="text-sm text-muted-night">{fmt(p.count, { n: products.length })}</p>
          </div>
          <Link href="/staff/products/new" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-dark">
            <Icon name="plus" size={18} /> {p.add}
          </Link>
        </div>
        <StaffProductList products={products} />
        <p className="text-xs text-muted-night">
          {p.editNote}
        </p>
        </main>
      </PageTransition>
    </StaffI18nProvider>
  );
}
