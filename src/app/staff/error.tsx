"use client";

import Link from "next/link";
import { useEffect } from "react";

// Keeps a failing staff page inside the staff area, with the reason and a way to retry.
export default function StaffError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const message = error instanceof Error ? error.message : String(error);

  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 py-20 sm:px-6">
      <span className="text-sm font-semibold text-brand">เกิดข้อผิดพลาด</span>
      <h1 className="font-display text-3xl font-bold">หน้านี้โหลดไม่สำเร็จ</h1>
      <p className="rounded-lg border border-[#26231f] bg-night-2 px-4 py-3 font-mono text-sm break-words text-muted-night">{message}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-dark">
          ลองใหม่
        </button>
        <Link href="/staff" className="inline-flex min-h-11 items-center rounded-lg border border-[#3d3934] px-5 font-semibold hover:border-white">
          กลับหน้าสินค้า
        </Link>
      </div>
    </main>
  );
}
