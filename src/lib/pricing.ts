import { checkoutEnabled } from "@/lib/site";
import type { PriceMode, Product, StockStatus, Variant } from "@/lib/types";

export type Currency = "THB" | "USD";

/** Catalog prices exclude VAT. Thai VAT applies to domestic sales; exports are quoted by staff. */
export const VAT_RATE = 0.07;

/** Demo-only indicative rate. Must come from the backend before launch. */
const DEMO_THB_PER_USD = 36;

export function formatMoney(thb: number, currency: Currency = "THB"): string {
  if (currency === "USD") return `US$${Math.round(thb / DEMO_THB_PER_USD).toLocaleString("en-US")}`;
  return `฿${thb.toLocaleString("en-US")}`;
}

/** Product-level price summary across its variants. Unknown prices are never treated as 0. */
export function productPrice(product: Product): { mode: PriceMode; amount: number | null } {
  const known = product.variants.map((v) => v.priceThb).filter((p): p is number => p != null);
  if (known.length === 0) return { mode: "ask", amount: null };
  const min = Math.min(...known);
  const allSame = known.length === product.variants.length && known.every((p) => p === min);
  return { mode: allSame ? "exact" : "from", amount: min };
}

/** Labels come from the dictionary (t.common): askPrice, and priceFrom with a {price} slot. */
export function priceLabel(mode: PriceMode, amount: number | null, currency: Currency, labels: { askPrice: string; priceFrom: string }): string {
  if (mode === "ask" || amount == null) return labels.askPrice;
  const price = formatMoney(amount, currency);
  return mode === "from" ? labels.priceFrom.replace("{price}", price) : price;
}

/** Best stock status across variants, used on listing cards. */
export function productStatus(product: Product): StockStatus {
  const order: StockStatus[] = ["ready", "preorder", "import", "out"];
  return order.find((s) => product.variants.some((v) => v.status === s)) ?? "out";
}

/** Direct purchase only for a fixed price with stock on hand, and only while checkout is on; everything else goes to the quote flow. */
export function canBuy(variant: Variant): boolean {
  return checkoutEnabled && variant.priceThb != null && variant.status === "ready";
}

/** Colour dot per stock status; the label is in the dictionary (t.status). */
export const statusDot: Record<StockStatus, string> = {
  ready: "bg-ready",
  preorder: "bg-preorder",
  import: "bg-import",
  out: "bg-out",
};
