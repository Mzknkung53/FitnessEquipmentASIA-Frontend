import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getAuthProfile } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "เข้าสู่ระบบพนักงาน",
  robots: { index: false, follow: false },
};

export default function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted-night">กำลังโหลด…</div>}>
      <StaffLogin searchParams={searchParams} />
    </Suspense>
  );
}

async function StaffLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const profile = await getAuthProfile();
  if (profile?.isStaff) redirect("/staff");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-brand">Staff</p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">เข้าสู่ระบบพนักงาน</h1>
        <p className="text-[15px] text-muted-night">
          ใช้ Google ของบัญชีที่ได้รับสิทธิ์แล้วเท่านั้น (เช่น admin) —{" "}
          <Link href="/" className="text-white underline-offset-2 hover:underline">
            กลับหน้าร้านลูกค้า
          </Link>
          {" · "}
          <Link href="/login" className="text-white underline-offset-2 hover:underline">
            login ลูกค้า
          </Link>
        </p>
      </div>

      {!authConfigured ? (
        <p className="text-sm text-brand">ยังไม่ได้ตั้งค่า Supabase</p>
      ) : (
        <div className="rounded-xl border border-[#2a2724] bg-[#151311] p-5">
          <GoogleSignInButton next="/staff" label="เข้าสู่ระบบพนักงานด้วย Google" />
          {params.error === "forbidden" && (
            <p className="mt-4 text-sm text-[#f0a0a0]">บัญชีนี้ยังไม่มีสิทธิ์พนักงาน ติดต่อแอดมินให้เพิ่มใน allowlist</p>
          )}
          {profile && !profile.isStaff && (
            <p className="mt-4 text-sm text-[#f0a0a0]">
              ล็อกอินอยู่ที่ {profile.email} แต่ยังไม่ใช่พนักงาน — ใช้บัญชี Google ที่ได้รับสิทธิ์ หรือออกจากระบบแล้วลองใหม่
            </p>
          )}
        </div>
      )}
    </div>
  );
}
