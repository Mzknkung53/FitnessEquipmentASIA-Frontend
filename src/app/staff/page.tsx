import Image from "next/image";
import { StaffScan } from "@/app/staff/staff-scan";
import { Icon } from "@/components/icons";
import { getProducts } from "@/lib/catalog";
import { sampleSkuCounts, sampleUnits } from "@/lib/data/sample-stock";

const menu = [
  { label: "สินค้าและรุ่นย่อย" },
  { label: "สต็อกและ QR", active: true },
  { label: "คำขอใบเสนอราคา", badge: 4 },
  { label: "คำสั่งซื้อและจัดส่ง" },
  { label: "งานบริการ / ประกัน" },
  { label: "หน้าเว็บและข้อมูลติดต่อ" },
];

export default async function StaffPage() {
  const products = await getProducts();
  return (
    <div className="flex min-h-dvh flex-wrap">
      <aside aria-label="เมนูพนักงาน" className="flex max-w-full flex-[1_1_250px] flex-col gap-1 border-r border-[#1f1d1a] px-4 py-[22px]">
        <Image src="/brand/fea-logo-on-black.jpg" alt="Fitness Equipment Asia" width={857} height={251} className="mb-1.5 ml-1.5 h-auto w-[176px]" />
        <span className="eyebrow px-3.5 pb-4 text-xs text-brand">Staff workspace</span>
        {menu.map((m) => (
          <span key={m.label} aria-current={m.active ? "page" : undefined} className={`flex min-h-[46px] items-center gap-2.5 rounded-lg px-3.5 text-[15px] ${m.active ? "bg-[#1a1816] font-semibold text-white shadow-[inset_3px_0_0_var(--color-brand)]" : "text-muted-night"}`}>
            {m.label}
            {m.badge && <span className="ml-auto min-w-[22px] rounded-full bg-brand text-center text-xs leading-[22px] text-white">{m.badge}</span>}
          </span>
        ))}
        <div className="mt-auto flex flex-col border-t border-[#1f1d1a] px-3.5 pt-4 text-sm">
          <span className="flex items-center gap-2"><Icon name="lock" size={14} />[ชื่อพนักงาน]</span>
          <span className="text-muted-night">บทบาท: คลังสินค้า · ต้นแบบ ยังไม่มีระบบล็อกอิน</span>
        </div>
      </aside>
      <StaffScan units={sampleUnits} skuCounts={sampleSkuCounts} products={products} />
    </div>
  );
}
