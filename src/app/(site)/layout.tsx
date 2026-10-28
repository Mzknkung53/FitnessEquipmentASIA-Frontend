import { Suspense } from "react";
import { ContactLauncher } from "@/components/contact-launcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAuthProfile } from "@/lib/auth";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<SiteHeader accountEmail={null} />}>
        <AuthedHeader />
      </Suspense>
      <main>{children}</main>
      <SiteFooter />
      <ContactLauncher />
    </>
  );
}

async function AuthedHeader() {
  const profile = await getAuthProfile();
  return <SiteHeader accountEmail={profile?.email ?? null} />;
}
