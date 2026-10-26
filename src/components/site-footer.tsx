import Image from "next/image";
import Link from "next/link";
import { contactChannels } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-brand bg-night text-white">
      <div className="wrap grid gap-10 pt-16 pb-12 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Image src="/brand/fea-logo-on-black.jpg" alt="Fitness Equipment Asia" width={857} height={251} className="h-auto w-[200px]" />
          <p className="text-muted-night">อุปกรณ์ฟิตเนสสำหรับบ้านและธุรกิจยิม ในไทย ลาว เมียนมา และจีน</p>
        </div>
        <FooterCol title="สินค้า" links={[["/products", "สินค้าทั้งหมด"], ["/products?cat=plate-loaded", "Plate-Loaded"], ["/products?cat=cardio", "คาร์ดิโอ"], ["/products?cat=racks", "แร็คและฟรีเวท"]]} />
        <FooterCol title="บริการ" links={[["/quote", "จัดชุดอุปกรณ์ยิม"], ["/showroom#warranty", "การรับประกัน"], ["/showroom#service", "แจ้งซ่อม"], ["/showroom#faq", "การจัดส่งและติดตั้ง"]]} />
        <div className="flex flex-col gap-2.5">
          <span className="font-display text-[17px] font-semibold">ติดต่อ</span>
          {contactChannels.map((c) =>
            c.href ? (
              <a key={c.name} href={c.href} className="text-muted-night hover:text-white">
                {c.name} · {c.handle}
              </a>
            ) : (
              <span key={c.name} className="text-muted-night">
                {c.name} · {c.handle}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-3 border-t border-[#23201d] pt-5 pb-7 text-[13px] text-muted-night">
        <span>© Fitness Equipment Asia · ต้นแบบ — สินค้าและราคาเป็นข้อมูลตัวอย่าง</span>
        <span className="flex gap-4">
          <Link href="/showroom#faq" className="hover:text-white">ความเป็นส่วนตัว</Link>
          <Link href="/showroom#faq" className="hover:text-white">ข้อกำหนด</Link>
        </span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-display text-[17px] font-semibold">{title}</span>
      {links.map(([href, label]) => (
        <Link key={label} href={href} className="text-muted-night hover:text-white">
          {label}
        </Link>
      ))}
    </div>
  );
}
