import type { PriceMode, Product, StockStatus, Variant } from "@/lib/types";

export type Currency = "THB" | "USD";

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

export function priceLabel(mode: PriceMode, amount: number | null, currency: Currency = "THB"): string {
  if (mode === "ask" || amount == null) return "สอบถามราคา";
  return (mode === "from" ? "เริ่มต้น " : "") + formatMoney(amount, currency);
}

/** Best stock status across variants, used on listing cards. */
export function productStatus(product: Product): StockStatus {
  const order: StockStatus[] = ["ready", "preorder", "import", "out"];
  return order.find((s) => product.variants.some((v) => v.status === s)) ?? "out";
}

/** Direct purchase only for a fixed price with stock on hand; everything else goes to the quote flow. */
export function canBuy(variant: Variant): boolean {
  return variant.priceThb != null && variant.status === "ready";
}

export const statusMeta: Record<StockStatus, { label: string; dot: string }> = {
  ready: { label: "พร้อมส่ง", dot: "bg-ready" },
  preorder: { label: "พรีออเดอร์", dot: "bg-preorder" },
  import: { label: "สั่งผลิต/นำเข้า", dot: "bg-import" },
  out: { label: "สินค้าหมด", dot: "bg-out" },
};
