"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Icon } from "@/components/icons";
import { fmt, localeLabel, localePath, locales, stripLocale } from "@/lib/i18n/config";
import { shop, useShop } from "@/lib/shop-store";
import { checkoutEnabled } from "@/lib/site";

function Count({ n, tone }: { n: number; tone: "red" | "white" }) {
  if (n === 0) return null;
  return (
    // Keyed by the count so each change remounts it and .bump plays again.
    <span key={n} className={`bump absolute top-1 right-0.5 min-w-[18px] rounded-full px-1 text-center text-[11px] leading-[18px] font-bold ${tone === "red" ? "bg-brand text-white" : "bg-white text-night"}`}>
      {n}
    </span>
  );
}

export function SiteHeader({ accountEmail = null }: { accountEmail?: string | null }) {
  const { lang, t, href } = useI18n();
  // Without the language prefix, so it reads the same on the server (/th/...) and in the browser (/...).
  const path = stripLocale(usePathname());
  const { quote, cart, currency } = useShop();
  const [open, setOpen] = useState(false);
  const quoteCount = quote.reduce((s, l) => s + l.qty, 0);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const nav = [
    { href: "/products", label: t.header.nav.products },
    { href: "/quote", label: t.header.nav.quote },
    { href: "/showroom#guides", label: t.header.nav.guides },
    { href: "/showroom#warranty", label: t.header.nav.service },
    { href: "/showroom", label: t.header.nav.showroom },
  ];

  return (
    <>
      <div className="border-b border-[#23201d] bg-night text-[13px] text-muted-night">
        <div className="wrap flex min-h-9 flex-wrap items-center justify-between gap-x-4">
          <span>{t.header.topBar}</span>
          <nav className="flex gap-1" aria-label={t.header.language}>
            {locales.map((l) => (
              <Link
                key={l}
                href={localePath(l, path)}
                hrefLang={l}
                prefetch={false}
                lang={l === "zh" ? "zh-Hans" : l}
                aria-current={l === lang ? "true" : undefined}
                className={`rounded px-1.5 py-1 ${l === lang ? "font-semibold text-white" : "hover:text-white"}`}
              >
                {localeLabel[l]}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <header className="sticky top-0 z-30 bg-night text-white" style={{ viewTransitionName: "site-header" }}>
        <div className="wrap flex min-h-[84px] items-center justify-between gap-6">
          <Link href={href("/")} aria-label={t.header.homeLink} className="shrink-0 leading-none">
            <Image src="/brand/fea-logo.png" alt="Fitness Equipment Asia" width={818} height={229} loading="eager" className="h-12 w-auto sm:h-[58px]" />
          </Link>
          <nav aria-label={t.header.mainMenu} className="hidden gap-9 lg:flex">
            {nav.map((n) => {
              const active = n.href === "/products" ? path.startsWith("/products") : path === n.href;
              return (
                <Link key={n.href} href={href(n.href)} aria-current={active ? "page" : undefined} className="nav-link py-2 text-[15px] font-medium">
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => shop.setCurrency(currency === "THB" ? "USD" : "THB")} aria-label={fmt(t.header.currency, { currency })} className="hidden min-h-11 rounded-full px-3 text-sm font-semibold hover:bg-[#1f1d1b] sm:block">
              {currency}
            </button>
            <Link href={href("/products")} aria-label={t.header.search} className="hidden size-11 place-items-center rounded-full hover:bg-[#1f1d1b] sm:grid">
              <Icon name="search" size={21} />
            </Link>
            <Link href={href("/quote")} aria-label={fmt(t.header.quoteCount, { n: quoteCount })} className="relative grid size-11 place-items-center rounded-full hover:bg-[#1f1d1b]">
              <Icon name="quote" size={21} />
              <Count n={quoteCount} tone="red" />
            </Link>
            {checkoutEnabled && (
              <Link href={href("/checkout")} aria-label={fmt(t.header.cartCount, { n: cartCount })} className="relative grid size-11 place-items-center rounded-full hover:bg-[#1f1d1b]">
                <Icon name="bag" size={21} />
                <Count n={cartCount} tone="white" />
              </Link>
            )}
            <Link
              href={href(accountEmail ? "/account" : "/login")}
              aria-label={accountEmail ? fmt(t.header.account, { email: accountEmail }) : t.header.signIn}
              title={accountEmail || t.header.signIn}
              className="hidden max-w-[160px] truncate rounded-full px-3 py-2 text-sm font-semibold hover:bg-[#1f1d1b] sm:inline-flex"
            >
              {accountEmail ? accountEmail.split("@")[0] : t.header.signIn}
            </Link>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={t.header.menu} className="grid size-11 place-items-center rounded-full hover:bg-[#1f1d1b] lg:hidden">
              <Icon name={open ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label={t.header.mainMenu} className="drop-in border-t border-night-line lg:hidden">
            <div className="wrap flex flex-col py-2">
              {nav.map((n) => (
                <Link key={n.href} href={href(n.href)} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-night-line font-display text-lg font-medium last:border-0">
                  {n.label}
                </Link>
              ))}
              <Link href={href(accountEmail ? "/account" : "/login")} onClick={() => setOpen(false)} className="flex min-h-12 items-center font-display text-lg font-medium">
                {accountEmail ? t.header.myAccount : t.header.signIn}
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
