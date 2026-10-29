import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ระบบพนักงาน",
  robots: { index: false, follow: false },
};

// Staff workspace is separate from the public storefront (no public header/footer).
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <div className="page-enter min-h-dvh bg-[#0b0a09] text-white">{children}</div>;
}
