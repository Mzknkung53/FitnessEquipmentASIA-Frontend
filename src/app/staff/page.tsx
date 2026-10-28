import Image from "next/image";
import { redirect } from "next/navigation";
import { StaffScan } from "@/app/staff/staff-scan";
import { Icon } from "@/components/icons";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthProfile } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";

const menu = [
  { label: "สินค้าและรุ่นย่อย", soon: true },
  { label: "สต็อกและ QR", active: true },
  { label: "คำขอใบเสนอราคา", soon: true },
  { label: "คำสั่งซื้อและจัดส่ง", soon: true },
  { label: "งานบริการ / ประกัน", soon: true },
  { label: "หน้าเว็บและข้อมูลติดต่อ", soon: true },
];

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const profile = await getAuthProfile();
  if (!profile) redirect("/staff/login");
  if (!profile.isStaff) redirect("/staff/login?error=forbidden");

  const products = await getProducts();
  return (
    <div className="flex min-h-dvh flex-wrap">
      <aside aria-label="เมนูพนักงาน" className="flex max-w-full flex-[1_1_250px] flex-col gap-1 border-r border-[#1f1d1a] px-4 py-[22px]">
        <Image src="/brand/fea-logo-on-black.jpg" alt="Fitness Equipment Asia" width={857} height={251} className="mb-1.5 ml-1.5 h-auto w-[176px]" />
        <span className="eyebrow px-3.5 pb-4 text-xs text-brand">Staff workspace</span>
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
          <SignOutButton className="mt-1 self-start text-left text-muted-night underline-offset-2 hover:text-white hover:underline" />
        </div>
      </aside>
      <StaffScan units={[]} skuCounts={{}} products={products} />
    </div>
  );
}
