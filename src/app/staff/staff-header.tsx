import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthProfile, type AuthProfile } from "@/lib/auth";

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

/** One slim bar for every staff page: brand, who is signed in, way back to the shop. */
export function StaffHeader({ profile }: { profile: AuthProfile }) {
  return (
    <header className="border-b border-[#1f1d1a] bg-[#0b0a09]">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
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
    </header>
  );
}
