import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { SignOutButton } from "@/components/sign-out-button";
import { canHandleQuotes, getAuthProfile, type AuthProfile } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

const roleLabel: Record<NonNullable<AuthProfile["role"]>, string> = {
  admin: "ผู้ดูแลระบบ",
  sales: "ฝ่ายขาย",
  warehouse: "คลังสินค้า",
  service: "งานบริการ",
};

/** Signed-in staff profile, or a redirect to the staff login. */
export async function requireStaff(): Promise<AuthProfile> {
  const profile = await getAuthProfile();
  if (!profile) redirect("/staff/login");
  if (!profile.isStaff) redirect("/staff/login?error=forbidden");
  return profile;
}

type Section = "products" | "quotes";

/** One slim bar for every staff page: brand, sections, who is signed in, way back to the shop. */
export async function StaffHeader({ profile, active }: { profile: AuthProfile; active: Section }) {
  const quotes = canHandleQuotes(profile);
  let newQuotes = 0;
  if (quotes) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.rpc("staff_inbox_counts");
    newQuotes = Number((data as { new_quotes?: number } | null)?.new_quotes ?? 0);
  }

  const tabs: { id: Section; href: string; label: string; badge?: number }[] = [
    { id: "products", href: "/staff", label: "สินค้า" },
    ...(quotes ? [{ id: "quotes" as const, href: "/staff/quotes", label: "ใบขอราคา", badge: newQuotes }] : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[#1f1d1a] bg-[#0b0a09]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-6 gap-y-2 px-4 pt-3 sm:px-6">
        <Link href="/staff" className="flex items-center gap-3">
          <Image src="/brand/fea-logo-on-black.jpg" alt="Fitness Equipment Asia" width={857} height={251} className="h-auto w-[120px]" />
          <span className="rounded border border-[#3d3934] px-2 py-0.5 text-xs font-semibold text-muted-night">หลังร้าน</span>
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-night">
            {profile.displayName || profile.email} · {profile.role ? roleLabel[profile.role] : "พนักงาน"}
          </span>
          <Link href="/" className="inline-flex items-center gap-1.5 text-muted-night hover:text-white">
            <Icon name="home" size={14} /> หน้าร้าน
          </Link>
          <SignOutButton className="text-muted-night hover:text-white" />
        </div>
      </div>
      <nav aria-label="ส่วนงาน" className="mx-auto flex max-w-[1100px] gap-1 px-2 sm:px-4">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            aria-current={t.id === active ? "page" : undefined}
            className={`relative inline-flex min-h-12 items-center gap-2 px-3 text-[15px] font-semibold transition-colors ${
              t.id === active ? "text-white" : "text-muted-night hover:text-white"
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className="badge-pulse grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs leading-5 text-white" aria-label={`ใหม่ ${t.badge} รายการ`}>
                {t.badge}
              </span>
            ) : null}
            {t.id === active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
