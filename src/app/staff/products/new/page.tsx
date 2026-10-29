import Link from "next/link";
import { Suspense } from "react";
import { StaffProductForm } from "@/app/staff/product-form";
import { requireStaff, StaffHeader } from "@/app/staff/staff-header";
import { PageTransition } from "@/components/page-transition";
import { Icon } from "@/components/icons";
import { StaffI18nProvider } from "@/app/staff/staff-i18n";
import { getCategories } from "@/lib/catalog";
import { getStaffI18n } from "@/lib/i18n/staff";

export const metadata = { title: "เพิ่มสินค้า" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted-night">…</div>}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  const profile = await requireStaff();
  const [categories, { lang, t }] = await Promise.all([getCategories(), getStaffI18n()]);
  return (
    <StaffI18nProvider lang={lang} t={t}>
      <StaffHeader profile={profile} active="products" />
      <PageTransition>
        <main className="mx-auto flex max-w-[760px] flex-col gap-6 px-4 pt-6 pb-16 sm:px-6">
        <Link href="/staff" className="inline-flex items-center gap-1.5 self-start text-sm text-muted-night hover:text-white">
          <Icon name="arrowLeft" size={14} /> {t.newProduct.back}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-4xl font-bold">{t.newProduct.title}</h1>
          <p className="text-sm text-muted-night">{t.newProduct.intro}</p>
        </div>
        <StaffProductForm categories={categories} />
        </main>
      </PageTransition>
    </StaffI18nProvider>
  );
}
