"use client";

import { useSyncExternalStore } from "react";
import type { Currency } from "@/lib/pricing";
import type { QuoteItem } from "@/lib/types";

// Quote basket + cart kept in localStorage so they survive browsing.
// A quote request never charges money or reserves stock; that happens on the backend later.

export type CartLine = { sku: string; slug: string; qty: number };

type ShopState = {
  quote: QuoteItem[];
  cart: CartLine[];
  currency: Currency;
  /** false during server render / hydration, before localStorage has been read */
  ready: boolean;
};

const STORAGE_KEY = "fea-shop-v1";
const SERVER: ShopState = { quote: [], cart: [], currency: "THB", ready: false };
const EMPTY: ShopState = { ...SERVER, ready: true };

let state: ShopState | null = null;
const listeners = new Set<() => void>();

function load(): ShopState {
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    state = raw ? readyFields(raw) : EMPTY;
  } catch {
    state = EMPTY;
  }
  return state;
}

function readyFields(raw: string): ShopState {
  const saved = JSON.parse(raw) as Partial<ShopState>;
  return { quote: saved.quote ?? [], cart: saved.cart ?? [], currency: saved.currency ?? "THB", ready: true };
}

function set(next: ShopState) {
  state = next;
  try {
    const { quote, cart, currency } = next;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ quote, cart, currency }));
  } catch {
    // Private mode or blocked storage: keep the in-memory state only.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useShop(): ShopState {
  return useSyncExternalStore(subscribe, load, () => SERVER);
}

function upsert<T extends { sku: string; qty: number }>(lines: T[], line: T): T[] {
  const existing = lines.find((l) => l.sku === line.sku);
  if (!existing) return [...lines, line];
  return lines.map((l) => (l.sku === line.sku ? { ...l, qty: l.qty + line.qty } : l));
}

export const shop = {
  addToQuote(item: QuoteItem) {
    const s = load();
    set({ ...s, quote: upsert(s.quote, item) });
  },
  setQuoteQty(sku: string, qty: number) {
    const s = load();
    set({ ...s, quote: s.quote.map((l) => (l.sku === sku ? { ...l, qty } : l)) });
  },
  setQuoteNote(sku: string, note: string) {
    const s = load();
    set({ ...s, quote: s.quote.map((l) => (l.sku === sku ? { ...l, note } : l)) });
  },
  removeFromQuote(sku: string) {
    const s = load();
    set({ ...s, quote: s.quote.filter((l) => l.sku !== sku) });
  },
  clearQuote() {
    set({ ...load(), quote: [] });
  },
  addToCart(line: CartLine) {
    const s = load();
    set({ ...s, cart: upsert(s.cart, line) });
  },
  setCartQty(sku: string, qty: number) {
    const s = load();
    set({ ...s, cart: s.cart.map((l) => (l.sku === sku ? { ...l, qty } : l)) });
  },
  removeFromCart(sku: string) {
    const s = load();
    set({ ...s, cart: s.cart.filter((l) => l.sku !== sku) });
  },
  setCurrency(currency: Currency) {
    set({ ...load(), currency });
  },
};
