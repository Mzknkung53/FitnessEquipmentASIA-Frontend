import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/app/(site)/checkout/checkout-client";
import { getProducts } from "@/lib/catalog";
import { checkoutEnabled } from "@/lib/site";

export const metadata: Metadata = { title: "ชำระเงิน" };

export default async function CheckoutPage() {
  if (!checkoutEnabled) redirect("/quote");
  const products = await getProducts();
  return <CheckoutClient products={products} />;
}
