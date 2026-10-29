"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { shop, useShop } from "@/lib/shop-store";
import { checkoutEnabled } from "@/lib/site";

const nav = [
  { href: "/products", label: "สินค้า" },
  { href: "/quote", label: "จัดยิม" },
  { href: "/showroom#guides", label: "วิธีใช้" },
  { href: "/showroom#warranty", label: "บริการหลังการขาย" },
  { href: "/showroom", label: "โชว์รูม" },
];

function Count({ n, tone }: { n: number; tone: "red" | "white" }) {
  if (n === 0) return null;
  return (
    <span className={`absolute top-1 right-0.5 min-w-[18px] rounded-full px-1 text-center text-[11px] leading-[18px] font-bold ${tone === "red" ? "bg-brand text-white" : "bg-white text-night"}`}>
      {n}
    </span>
  );
}

export function SiteHeader({ accountEmail = null }: { accountEmail?: string | null }) {
  const pathname = usePathname();
  const { quote, cart, currency } = useShop();
  const [open, setOpen] = useState(false);
  const quoteCount = quote.reduce((s, l) => s + l.qty, 0);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <>
      <div className="border-b border-[#23201d] bg-night text-[13px] text-muted-night">
        <div className="wrap flex min-h-9 flex-wrap items-center justify-between gap-x-4">
          <span>ส่งและติดตั้งในไทย ลาว เมียนมา และจีน · ค่าขนส่งประเมินโดยทีมงาน</span>
          <span className="flex gap-3.5" aria-label="ภาษา">
            <span className="font-semibold text-white">TH</span>
            <span title="กำลังจัดทำ">EN</span>
            <span title="กำลังจัดทำ">中文</span>
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-30 bg-night text-white">
        <div className="wrap flex min-h-[84px] items-center justify-between gap-6">
          <Link href="/" aria-label="Fitness Equipment Asia หน้าแรก" className="shrink-0 leading-none">
            <Image src="/brand/fea-logo-on-black.jpg" alt="Fitness Equipment Asia" width={857} height={251} loading="eager" className="h-12 w-auto sm:h-[58px]" />
          </Link>
          <nav aria-label="เมนูหลัก" className="hidden gap-9 lg:flex">
            {nav.map((n) => {
              const active = n.href === "/products" ? pathname.startsWith("/products") : pathname === n.href;
              return (
                <Link key={n.label} href={n.href} aria-current={active ? "page" : undefined} className={`border-b-2 py-2 text-[15px] font-medium transition-colors hover:border-brand ${active ? "border-brand" : "border-transparent"}`}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => shop.setCurrency(currency === "THB" ? "USD" : "THB")} aria-label={`สกุลเงิน ${currency} — กดเพื่อสลับ`} className="hidden min-h-11 rounded-full px-3 text-sm font-semibold hover:bg-[#1f1d1b] sm:block">
              {currency}
            </button>
            <Link href="/products" aria-label="ค้นหาสินค้า" className="hidden size-11 place-items-center rounded-full hover:bg-[#1f1d1b] sm:grid">
              <Icon name="search" size={21} />
            </Link>
            <Link href="/quote" aria-label={`รายการขอราคา ${quoteCount} ชิ้น`} className="relative grid size-11 place-items-center rounded-full hover:bg-[#1f1d1b]">
              <Icon name="quote" size={21} />
              <Count n={quoteCount} tone="red" />
            </Link>
            {checkoutEnabled && (
              <Link href="/checkout" aria-label={`ตะกร้า ${cartCount} ชิ้น`} className="relative grid size-11 place-items-center rounded-full hover:bg-[#1f1d1b]">
                <Icon name="bag" size={21} />
                <Count n={cartCount} tone="white" />
              </Link>
            )}
            <Link
              href={accountEmail ? "/account" : "/login"}
              aria-label={accountEmail ? `บัญชี ${accountEmail}` : "เข้าสู่ระบบ"}
              title={accountEmail || "เข้าสู่ระบบ"}
              className="hidden max-w-[160px] truncate rounded-full px-3 py-2 text-sm font-semibold hover:bg-[#1f1d1b] sm:inline-flex"
            >
              {accountEmail ? accountEmail.split("@")[0] : "เข้าสู่ระบบ"}
            </Link>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label="เมนู" className="grid size-11 place-items-center rounded-full hover:bg-[#1f1d1b] lg:hidden">
              <Icon name={open ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="เมนูหลัก" className="drop-in border-t border-night-line lg:hidden">
            <div className="wrap flex flex-col py-2">
              {nav.map((n) => (
                <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-night-line font-display text-lg font-medium last:border-0">
                  {n.label}
                </Link>
              ))}
              <Link href={accountEmail ? "/account" : "/login"} onClick={() => setOpen(false)} className="flex min-h-12 items-center font-display text-lg font-medium">
                {accountEmail ? "บัญชีของฉัน" : "เข้าสู่ระบบ"}
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
