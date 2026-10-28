import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthProfile } from "@/lib/auth";

export const metadata = { title: "บัญชีของฉัน" };

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="wrap py-24 text-muted">กำลังโหลดบัญชี…</div>}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const profile = await getAuthProfile();
  if (!profile) redirect("/login?next=/account");

  return (
    <section className="bg-stage">
      <div className="wrap flex max-w-[640px] flex-col gap-8 py-20">
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-brand">บัญชีลูกค้า</p>
          <h1 className="font-display text-[clamp(36px,5vw,48px)] leading-[1.1] font-bold text-ink">บัญชีของฉัน</h1>
          <p className="text-muted">ทีมงานจะใช้ที่อยู่อีเมลนี้ในการติดต่อและส่งใบเสนอราคา</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <dl className="grid gap-4 text-[15px]">
            <div>
              <dt className="text-muted">ชื่อ</dt>
              <dd className="mt-1 font-semibold text-ink">{profile.displayName || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">อีเมลติดต่อ</dt>
              <dd className="mt-1 font-semibold break-all text-ink">{profile.email || "—"}</dd>
            </div>
            {profile.isStaff && (
              <div>
                <dt className="text-muted">บทบาทพนักงาน</dt>
                <dd className="mt-1 font-semibold text-ink">{profile.role}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quote" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-dark">
              ไปขอใบเสนอราคา
            </Link>
            {profile.isStaff && (
              <Link href="/staff" className="inline-flex min-h-11 items-center rounded-lg border border-control px-5 font-semibold text-ink hover:bg-stage">
                เข้าหน้าพนักงาน
              </Link>
            )}
            <SignOutButton className="inline-flex min-h-11 items-center rounded-lg px-4 font-semibold text-muted hover:text-ink" />
          </div>
        </div>
      </div>
    </section>
  );
}
