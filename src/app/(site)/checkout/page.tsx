import type { Metadata } from "next";
import { CheckoutClient } from "@/app/(site)/checkout/checkout-client";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "ชำระเงิน" };

export default async function CheckoutPage() {
  const products = await getProducts();
  return <CheckoutClient products={products} />;
}
