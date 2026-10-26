import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-stage px-4 text-center">
      <span className="hollow font-display text-[140px] leading-none font-bold text-ink">404</span>
      <h1 className="font-display text-4xl font-bold">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="text-muted">สินค้าอาจถูกย้ายหรือยังไม่เผยแพร่</p>
      <Link href="/products" className="inline-flex min-h-14 items-center rounded-md bg-brand px-7 font-display text-lg font-semibold text-white">
        ดูสินค้าทั้งหมด
      </Link>
    </main>
  );
}
