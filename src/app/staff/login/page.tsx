import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StaffLangSwitch } from "@/app/staff/staff-i18n";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getAuthProfile } from "@/lib/auth";
import { fmt, localePath } from "@/lib/i18n/config";
import { getStaffI18n } from "@/lib/i18n/staff";
import { authConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Staff · เข้าสู่ระบบพนักงาน",
  robots: { index: false, follow: false },
};

export default function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted-night">…</div>}>
      <StaffLogin searchParams={searchParams} />
    </Suspense>
  );
}

async function StaffLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, profile, { lang, t }] = await Promise.all([searchParams, getAuthProfile(), getStaffI18n()]);
  if (profile?.isStaff) redirect("/staff");
  const l = t.login;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow text-brand">Staff</p>
          <StaffLangSwitch lang={lang} label={t.shell.language} />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">{l.title}</h1>
        <p className="text-[15px] text-muted-night">
          {l.intro}{" "}
          <Link href={localePath(lang, "/")} className="text-white underline-offset-2 hover:underline">
            {l.backToShop}
          </Link>
          {" · "}
          <Link href={localePath(lang, "/login")} className="text-white underline-offset-2 hover:underline">
            {l.customerLogin}
          </Link>
        </p>
      </div>

      {!authConfigured ? (
        <p className="text-sm text-brand">{l.notConfigured}</p>
      ) : (
        <div className="rounded-xl border border-[#2a2724] bg-[#151311] p-5">
          <GoogleSignInButton next="/staff" label={l.button} busyLabel={l.opening} errorLabel={l.error} />
          {params.error === "forbidden" && <p className="mt-4 text-sm text-[#f0a0a0]">{l.forbidden}</p>}
          {profile && !profile.isStaff && <p className="mt-4 text-sm text-[#f0a0a0]">{fmt(l.notStaff, { email: profile.email ?? "" })}</p>}
        </div>
      )}
    </div>
  );
}
