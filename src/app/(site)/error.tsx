"use client";

import Link from "next/link";
import { useEffect } from "react";

// Shown inside the storefront layout (header and footer stay), so a failing page
// never leaves the visitor on a dead end.
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="wrap flex min-h-[60vh] flex-col items-start justify-center gap-5 py-24">
      <span className="eyebrow text-brand">เกิดข้อผิดพลาด</span>
      <h1 className="font-display text-[clamp(32px,5vw,48px)] leading-tight font-bold">หน้านี้โหลดไม่สำเร็จ</h1>
      <p className="max-w-[560px] text-muted">ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้ง หรือติดต่อทีมงานผ่านช่องทางด้านล่างได้เลย</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="inline-flex min-h-12 items-center rounded-md bg-brand px-6 font-semibold text-white hover:bg-brand-dark">
          ลองใหม่
        </button>
        <Link href="/" className="inline-flex min-h-12 items-center rounded-md border-[1.5px] border-ink px-6 font-semibold">
          กลับหน้าแรก
        </Link>
      </div>
    </section>
  );
}
