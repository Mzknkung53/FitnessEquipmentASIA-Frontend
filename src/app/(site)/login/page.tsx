import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getAuthProfile } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/env";

export const metadata = { title: "เข้าสู่ระบบลูกค้า" };

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const profile = await getAuthProfile();
  if (profile) redirect(params.next?.startsWith("/") ? params.next : "/account");

  return (
    <section className="bg-stage">
      <div className="wrap flex max-w-[560px] flex-col gap-8 py-20">
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-brand">บัญชีลูกค้า</p>
          <h1 className="font-display text-[clamp(36px,5vw,52px)] leading-[1.1] font-bold tracking-[-0.02em] text-ink">
            เข้าสู่ระบบด้วย Google
          </h1>
          <p className="text-[17px] text-muted">
            ใช้เมื่อขอใบเสนอราคาหรือติดต่อทีมงาน — เราจะรู้ว่าต้องส่งรายละเอียดกลับไปที่อีเมลไหน
            ไม่บังคับล็อกอินเพื่อดูสินค้า
          </p>
        </div>

        {!authConfigured ? (
          <p className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-muted">
            ยังไม่ได้ตั้งค่า Supabase ใน `.env.local`
          </p>
        ) : (
          <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_12px_40px_rgba(22,19,15,0.06)]">
            <GoogleSignInButton next={params.next?.startsWith("/") ? params.next : "/account"} />
            {params.error && (
              <p className="mt-4 text-sm text-brand">เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง หรือตรวจว่าเปิด Google ใน Supabase แล้ว</p>
            )}
            <p className="mt-5 text-sm text-muted">
              พนักงานคลัง / แอดมินใช้หน้า{" "}
              <Link href="/staff/login" className="font-semibold text-ink underline-offset-2 hover:underline">
                /staff/login
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
