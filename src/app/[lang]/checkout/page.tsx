import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/app/[lang]/checkout/checkout-client";
import { getProducts } from "@/lib/catalog";
import { langFrom } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/config";
import { checkoutEnabled } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  const { t } = await langFrom(params);
  return { title: t.meta.checkout };
}

// The checkout screen itself is Thai only; it stays off until online ordering exists.
export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
  const { lang } = await langFrom(params);
  if (!checkoutEnabled) redirect(localePath(lang, "/quote"));
  const products = await getProducts();
  return <CheckoutClient products={products} />;
}
