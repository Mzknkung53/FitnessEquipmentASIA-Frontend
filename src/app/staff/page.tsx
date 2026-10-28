import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StaffProductForm } from "@/app/staff/product-form";
import { Icon } from "@/components/icons";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthProfile } from "@/lib/auth";
import { getCategories } from "@/lib/catalog";
import { formatMoney } from "@/lib/pricing";
import { createServerSupabase } from "@/lib/supabase/server";

const menu = [
  { label: "สินค้าและรุ่นย่อย", active: true },
  { label: "สต็อกและ QR", soon: true },
  { label: "คำขอใบเสนอราคา", soon: true },
  { label: "คำสั่งซื้อและจัดส่ง", soon: true },
  { label: "งานบริการ / ประกัน", soon: true },
  { label: "หน้าเว็บและข้อมูลติดต่อ", soon: true },
];

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted-night">กำลังโหลด…</div>}>
      <StaffWorkspace />
    </Suspense>
  );
}

async function StaffWorkspace() {
  const profile = await getAuthProfile();
  if (!profile) redirect("/staff/login");
  if (!profile.isStaff) redirect("/staff/login?error=forbidden");

  const supabase = await createServerSupabase();
  const [{ data: productRows }, categories] = await Promise.all([
    supabase
      .from("products")
      .select("slug, model, name_th, name_en, status, variants(price_thb)")
      .order("created_at", { ascending: false })
      .limit(50),
    getCategories(),
  ]);
  const products = productRows ?? [];

  return (
    <div className="flex min-h-dvh flex-wrap">
      <aside aria-label="เมนูพนักงาน" className="flex max-w-full flex-[1_1_250px] flex-col gap-1 border-r border-[#1f1d1a] px-4 py-[22px]">
        <Image src="/brand/fea-logo-on-black.jpg" alt="Fitness Equipment Asia" width={857} height={251} className="mb-1.5 ml-1.5 h-auto w-[176px]" />
        <span className="eyebrow px-3.5 pb-4 text-xs text-brand">Staff workspace</span>
        <Link href="/" className="mb-2 flex min-h-[46px] items-center gap-2.5 rounded-lg border border-[#2a2724] px-3.5 text-[15px] font-semibold text-white hover:border-brand">
          <Icon name="home" size={16} /> กลับหน้าร้านลูกค้า
        </Link>
        {menu.map((m) => (
          <span
            key={m.label}
            aria-current={m.active ? "page" : undefined}
            title={m.soon ? "ยังไม่เปิดใช้" : undefined}
            className={`flex min-h-[46px] items-center gap-2.5 rounded-lg px-3.5 text-[15px] ${
              m.active
                ? "bg-[#1a1816] font-semibold text-white shadow-[inset_3px_0_0_var(--color-brand)]"
                : "cursor-not-allowed text-muted-night/55"
            }`}
          >
            {m.label}
            {m.soon && <span className="ml-auto rounded border border-[#3d3934] px-1.5 text-[11px] text-muted-night">เร็วๆ นี้</span>}
          </span>
        ))}
        <div className="mt-auto flex flex-col gap-2 border-t border-[#1f1d1a] px-3.5 pt-4 text-sm">
          <span className="flex items-center gap-2">
            <Icon name="lock" size={14} />
            {profile.displayName || profile.email}
          </span>
          <span className="text-muted-night">บทบาท: {profile.role}</span>
          <span className="truncate text-muted-night">{profile.email}</span>
          <Link href="/products" className="text-muted-night underline-offset-2 hover:text-white hover:underline">
            ดูหน้าสินค้าทั้งหมด
          </Link>
          <SignOutButton className="mt-1 self-start text-left text-muted-night underline-offset-2 hover:text-white hover:underline" />
        </div>
      </aside>

      <main className="flex min-w-0 flex-[999_1_680px] flex-col gap-8 px-4 pt-8 pb-14 sm:px-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-[clamp(36px,5vw,52px)] leading-none font-bold tracking-[-0.02em]">
            สินค้า<span className="hollow-thin text-white">ในระบบ</span>
          </h1>
          <span className="text-sm text-muted-night">{products.length} รายการ</span>
        </div>

        <StaffProductForm categories={categories} />

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold">รายการล่าสุด</h2>
          {products.length === 0 ? (
            <p className="rounded-2xl border border-[#26231f] bg-night-2 p-6 text-muted-night">ยังไม่มีสินค้า — เพิ่มรายการด้านบนได้เลย</p>
          ) : (
            <ul className="divide-y divide-[#26231f] overflow-hidden rounded-2xl border border-[#26231f] bg-night-2">
              {products.map((p) => {
                const variants = (p.variants ?? []) as { price_thb: number | null }[];
                const prices = variants.map((v) => v.price_thb).filter((n): n is number => n != null);
                const priceLabel =
                  prices.length === 0 ? "สอบถามราคา" : prices.length === 1 ? formatMoney(prices[0], "THB") : `เริ่ม ${formatMoney(Math.min(...prices), "THB")}`;
                return (
                  <li key={p.slug} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-night">
                        {p.model} · {p.status}
                      </p>
                      <p className="truncate font-semibold">{p.name_th}</p>
                      <p className="text-sm text-muted-night">{p.name_en}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm tabular-nums text-[#d8d3cc]">{priceLabel}</span>
                      {p.status === "published" ? (
                        <Link href={`/products/${p.slug}`} className="rounded-lg border border-[#3d3934] px-3 py-2 text-sm font-semibold hover:border-white">
                          ดูหน้าเว็บ
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-night">ยังไม่เผยแพร่</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
