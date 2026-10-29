"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { isLocale, LANG_COOKIE, type Locale } from "@/lib/i18n/config";

// Rendered outside the pages' dictionary provider, so it carries its own few words
// and reads the language cookie in the browser (Thai while rendering on the server).
const text = {
  th: { eyebrow: "เกิดข้อผิดพลาด", title: "หน้านี้โหลดไม่สำเร็จ", retry: "ลองใหม่", back: "กลับหน้าสินค้า" },
  en: { eyebrow: "Something went wrong", title: "This page didn't load", retry: "Try again", back: "Back to products" },
  zh: { eyebrow: "出错了", title: "页面加载失败", retry: "重试", back: "返回产品列表" },
};

const noSubscribe = () => () => {};
const cookieLang = (): Locale => {
  const v = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`))?.[1] ?? "";
  return isLocale(v) ? v : "th";
};

// Keeps a failing staff page inside the staff area, with the reason and a way to retry.
export default function StaffError({ error, retry }: { error: unknown; retry: () => void }) {
  const lang = useSyncExternalStore(noSubscribe, cookieLang, (): Locale => "th");
  const t = text[lang];
  useEffect(() => {
    console.error(error);
  }, [error]);
  const message = error instanceof Error ? error.message : String(error);

  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 py-20 sm:px-6">
      <span className="text-sm font-semibold text-brand">{t.eyebrow}</span>
      <h1 className="font-display text-3xl font-bold">{t.title}</h1>
      <p className="rounded-lg border border-[#26231f] bg-night-2 px-4 py-3 font-mono text-sm break-words text-muted-night">{message}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-dark">
          {t.retry}
        </button>
        <Link href="/staff" className="inline-flex min-h-11 items-center rounded-lg border border-[#3d3934] px-5 font-semibold hover:border-white">
          {t.back}
        </Link>
      </div>
    </main>
  );
}
